const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { runAsync, allAsync, getAsync, DB_FILE } = require('../utils/db');
const { authenticate, authorizeRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create a task
router.post('/',
  authenticate,
  body('title').isLength({min:1}),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, description } = req.body;
    const db = new sqlite3.Database(DB_FILE);
    try {
      const result = await runAsync(db, 'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)', [req.user.id, title, description || null]);
      res.status(201).json({ id: result.lastID, title, description, status: 'pending' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    } finally { db.close(); }
});

// Get all tasks (admin sees all; user sees their own)
router.get('/', authenticate, async (req, res) => {
  const db = new sqlite3.Database(DB_FILE);
  try {
    if (req.user.role === 'admin') {
      const rows = await allAsync(db, 'SELECT t.*, u.email as owner_email FROM tasks t LEFT JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC');
      return res.json(rows);
    } else {
      const rows = await allAsync(db, 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { db.close(); }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  const db = new sqlite3.Database(DB_FILE);
  try {
    const task = await getAsync(db, 'SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { db.close(); }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  const { title, description, status } = req.body;
  const db = new sqlite3.Database(DB_FILE);
  try {
    const task = await getAsync(db, 'SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await runAsync(db, 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?', [title || task.title, description || task.description, status || task.status, req.params.id]);
    const updated = await getAsync(db, 'SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { db.close(); }
});

// Delete task (only admin or owner)
router.delete('/:id', authenticate, async (req, res) => {
  const db = new sqlite3.Database(DB_FILE);
  try {
    const task = await getAsync(db, 'SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await runAsync(db, 'DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { db.close(); }
});

module.exports = router;