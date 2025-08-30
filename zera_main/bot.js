// zera_main/bot.js
const { loadPlugins } = require("../plugins/loader");
const logger = require("../logs/logger");
const helpers = require("../utils/helpers");

class ZeraBot {
  constructor() {
    this.commands = new Map();
  }
  async start() {
    logger.info("🚀 Starting ZERA-X Bot...");
    loadPlugins(this);
  }
  async handleCommand(command, args, sender) {
    if (this.commands.has(command)) {
      try {
        await this.commands.get(command).execute(args, sender);
      } catch (err) {
        logger.error(err.message);
      }
    }
  }
}
module.exports = ZeraBot;
