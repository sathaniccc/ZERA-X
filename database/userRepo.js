// database/userRepo.js
const mongoose = require("mongoose");
const { isMongoDB, getSQLite } = require("./db");

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  createdAt: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function addUser(id, name) {
  if (isMongoDB()) {
    return await User.create({ id, name, createdAt: new Date().toISOString() });
  } else {
    const sqlite = getSQLite();
    return new Promise((resolve, reject) => {
      sqlite.run(
        "INSERT OR REPLACE INTO users (id, name, createdAt) VALUES (?, ?, ?)",
        [id, name, new Date().toISOString()],
        (err) => (err ? reject(err) : resolve(true))
      );
    });
  }
}

async function getUser(id) {
  if (isMongoDB()) {
    return await User.findOne({ id });
  } else {
    const sqlite = getSQLite();
    return new Promise((resolve, reject) => {
      sqlite.get("SELECT * FROM users WHERE id = ?", [id], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });
  }
}

module.exports = { addUser, getUser };
