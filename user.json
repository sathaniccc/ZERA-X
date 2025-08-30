// database/db.js
const mongoose = require("mongoose");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let db;
async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("⚠️ MongoDB failed, switching to SQLite...");
    db = new sqlite3.Database(path.join(__dirname, "zera.sqlite"));
  }
}
module.exports = { connect, db };
