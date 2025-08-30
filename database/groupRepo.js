// database/groupRepo.js
const mongoose = require("mongoose");
const { isMongoDB, getSQLite } = require("./db");

const GroupSchema = new mongoose.Schema({
  id: String,
  title: String,
  createdAt: String,
});
const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);

async function addGroup(id, title) {
  if (isMongoDB()) {
    return await Group.create({ id, title, createdAt: new Date().toISOString() });
  } else {
    const sqlite = getSQLite();
    return new Promise((resolve, reject) => {
      sqlite.run(
        "INSERT OR REPLACE INTO groups (id, title, createdAt) VALUES (?, ?, ?)",
        [id, title, new Date().toISOString()],
        (err) => (err ? reject(err) : resolve(true))
      );
    });
  }
}

async function getGroup(id) {
  if (isMongoDB()) {
    return await Group.findOne({ id });
  } else {
    const sqlite = getSQLite();
    return new Promise((resolve, reject) => {
      sqlite.get("SELECT * FROM groups WHERE id = ?", [id], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });
  }
}

module.exports = { addGroup, getGroup };
