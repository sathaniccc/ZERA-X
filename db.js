const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// 🔹 Database path
const dbPath = path.join(__dirname, "database", "zeraX.db");

// Ensure database folder exists
if (!fs.existsSync(path.join(__dirname, "database"))) {
    fs.mkdirSync(path.join(__dirname, "database"));
}

// 🔹 Connect to DB
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to ZERA X database");
    }
});

// 🔹 Create default tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        joined_at TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);
});

// 🔹 DB helper functions
function addUser(id, name) {
    db.run(`INSERT OR REPLACE INTO users (id, name, joined_at) VALUES (?, ?, datetime('now'))`, [id, name]);
}

function getUser(id, callback) {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (callback) callback(err, row);
    });
}

function setSetting(key, value) {
    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
}

function getSetting(key, callback) {
    db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
        if (callback) callback(err, row ? row.value : null);
    });
}

module.exports = { db, addUser, getUser, setSetting, getSetting };
