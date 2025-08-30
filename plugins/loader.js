// plugins/loader.js
const fs = require("fs");
const path = require("path");

function loadPlugins(bot) {
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));
  for (const file of files) {
    const plugin = require(path.join(__dirname, file));
    if (plugin && plugin.command) {
      bot.commands.set(plugin.command, plugin);
    }
  }
}
module.exports = { loadPlugins };
