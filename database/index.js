// database/index.js
const { connectDB } = require("./db");
const UserRepo = require("./userRepo");
const GroupRepo = require("./groupRepo");
const SettingsRepo = require("./settingsRepo");

module.exports = {
  connectDB,
  UserRepo,
  GroupRepo,
  SettingsRepo,
};
