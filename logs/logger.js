// logs/logger.js
const fs = require("fs");
module.exports = (msg) => {
  fs.appendFileSync("./logs/bot.log", `[${new Date()}] ${msg}\n`);
};
