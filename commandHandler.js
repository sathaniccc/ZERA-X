/**
 * ZERA-X 2025 - Command Handler
 * Author: SATHANIC (ZERA-X TEAM)
 */

const fs = require("fs");
const path = require("path");
const prefix = "!"; // Default prefix (config.jsൽ നിന്നും കൂടി load ചെയ്യാം)

async function commandHandler(sock, msg, config) {
    try {
        const m = msg.messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const type = Object.keys(m.message)[0];
        const body = 
            (type === "conversation" && m.message.conversation) ||
            (type === "extendedTextMessage" && m.message.extendedTextMessage.text) ||
            (type === "imageMessage" && m.message.imageMessage.caption) ||
            (type === "videoMessage" && m.message.videoMessage.caption) ||
            "";

        if (!body.startsWith(prefix)) return;
        const args = body.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        console.log(`⚡ Command Received: ${cmd} | From: ${from}`);

        // --- Basic Commands ---
        switch (cmd) {
            case "alive":
                await sock.sendMessage(from, { text: `✅ *ZERA-X 2025 is Alive!* ⚡\n\nPrefix: ${prefix}` }, { quoted: m });
                break;

            case "ping":
                const start = new Date().getTime();
                await sock.sendMessage(from, { text: "🏓 Pong!" }, { quoted: m });
                const end = new Date().getTime();
                await sock.sendMessage(from, { text: `⚡ Response Time: *${end - start}ms*` });
                break;

            case "menu":
                await sock.sendMessage(from, {
                    text: `📖 *ZERA-X COMMANDS MENU*\n\n`
                        + `> ⚡ alive\n`
                        + `> ⚡ ping\n`
                        + `> ⚡ help\n`
                        + `> ⚡ about\n`
                        + `> ⚡ tools (calculator, sticker, downloader...)\n\n`
                        + `More plugins auto-loaded ✅`
                }, { quoted: m });
                break;

            case "about":
                await sock.sendMessage(from, { text: `🤖 *ZERA-X BOT 2025*\nCreated by: SATHANIC\nPowered with: Baileys 2025` }, { quoted: m });
                break;

            case "help":
                await sock.sendMessage(from, { text: `ℹ️ Use ${prefix}menu to see all available commands.` }, { quoted: m });
                break;

            default:
                // --- Plugin Loader (dynamic commands from /plugins) ---
                const pluginsDir = path.join(__dirname, "plugins");
                fs.readdirSync(pluginsDir).forEach((file) => {
                    if (file.endsWith(".js")) {
                        try {
                            const plugin = require(path.join(pluginsDir, file));
                            if (plugin && typeof plugin.run === "function" && plugin.cmd === cmd) {
                                plugin.run(sock, m, args, config);
                            }
                        } catch (err) {
                            console.error(`❌ Error in plugin ${file}:`, err);
                        }
                    }
                });
                break;
        }
    } catch (err) {
        console.error("❌ Command Handler Error:", err);
    }
}

module.exports = { commandHandler };
