/**
 * ZERA-X 2025 - Database Handler
 * Author: SATHANIC (ZERA-X TEAM)
 */

const fs = require("fs");
const path = require("path");

const dbDir = path.join(__dirname, "database");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const dbFile = path.join(dbDir, "zera_db.json");

// ✅ Initial DB
let db = {
    users: {},      // User data store
    groups: {},     // Group-specific data
    settings: {},   // Bot settings
};

// Load existing DB
if (fs.existsSync(dbFile)) {
    try {
        db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
        console.log("📂 Database loaded successfully.");
    } catch (e) {
        console.error("❌ Error loading DB:", e);
    }
}

// Save DB
function saveDB() {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf8");
}

// ✅ User functions
function addUser(id) {
    if (!db.users[id]) {
        db.users[id] = { warns: 0, xp: 0, premium: false };
        saveDB();
    }
    return db.users[id];
}

function updateUser(id, data) {
    if (!db.users[id]) addUser(id);
    db.users[id] = { ...db.users[id], ...data };
    saveDB();
    return db.users[id];
}

function getUser(id) {
    return db.users[id] || addUser(id);
}

// ✅ Group functions
function addGroup(id) {
    if (!db.groups[id]) {
        db.groups[id] = { welcome: true, antiLink: false, mute: false };
        saveDB();
    }
    return db.groups[id];
}

function updateGroup(id, data) {
    if (!db.groups[id]) addGroup(id);
    db.groups[id] = { ...db.groups[id], ...data };
    saveDB();
    return db.groups[id];
}

function getGroup(id) {
    return db.groups[id] || addGroup(id);
}

module.exports = {
    db,
    saveDB,
    addUser,
    updateUser,
    getUser,
    addGroup,
    updateGroup,
    getGroup,
};
