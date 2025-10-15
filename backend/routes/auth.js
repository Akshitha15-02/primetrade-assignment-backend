const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { runAsync, getAsync, DB_FILE } = require('../utils/db');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1h';

router.post('/register',
  body('name').isLength({min:2}),
  body('email').isEmail(),
  body('password').isLength({min:6}),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const db = new sqlite3.Database(DB_FILE);
    try {
      const existing = await getAsync(db, 'SELECT * FROM users WHERE email = ?', [email]);
      if (existing) return res.status(400).json({ error: 'Email already registered' });
      const hash = await bcrypt.hash(password, 10);
      const result = await runAsync(db, 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
      const id = result.lastID;
      const token = jwt.sign({ id, email, role: 'user', name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
      res.json({ token, user: { id, name, email, role: 'user' } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    } finally { db.close(); }
});

router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const db = new sqlite3.Database(DB_FILE);
    try {
      const user = await getAsync(db, 'SELECT * FROM users WHERE email = ?', [email]);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    } finally { db.close(); }
});

module.exports = router;