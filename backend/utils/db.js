const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'database.sqlite');

function runAsync(db, sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function allAsync(db, sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getAsync(db, sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function initDb() {
  const dbExists = fs.existsSync(DB_FILE);
  const db = new sqlite3.Database(DB_FILE);
  if (!dbExists) {
    // create tables
    await runAsync(db, `CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
    await runAsync(db, `CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);
    // create an admin user (password: Admin@123)
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('Admin@123', 10);
    await runAsync(db, `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Admin', 'admin@primetrade.local', hash, 'admin']);
    console.log('DB initialized with admin user admin@primetrade.local / Admin@123');
  }
  db.close();
}

module.exports = { initDb, runAsync, allAsync, getAsync, DB_FILE };