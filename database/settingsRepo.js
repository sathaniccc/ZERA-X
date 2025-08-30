// database/settingsRepo.js
const { isMongoDB, getSQLite } = require("./db");
const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  key: String,
  value: String,
});
const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

async function setSetting(key, value) {
  if (isMongoDB()) {
    return await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
  } else {
    const sqlite = getSQLite();
    return new Promise((resolve, reject) => {
      sqlite.run(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        [key, value],
        (err) => (err ? reject(err) : resolve(true))
      );
    });
  }
}

async function getSetting(key) {
  if (isMongoDB()) {
    return await Settings.findOne({ key });
  } else {
    const sqlite = getSQLite();
    return new Promise((resolve, reject) => {
      sqlite.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) =>
        err ? reject(err) : resolve(row?.value)
      );
    });
  }
}

module.exports = { setSetting, getSetting };
