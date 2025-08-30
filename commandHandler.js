const fs = require("fs");
const path = require("path");
const config = require("./config");

let commands = new Map();

// 🔹 Load all commands from zera_main/ & plugins/
function loadCommands(sock) {
    const mainDir = path.join(__dirname, "zera_main");
    const pluginDir = path.join(__dirname, "plugins");

    // Helper function
    const loadFromDir = (dir) => {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach((file) => {
            if (file.endsWith(".js")) {
                const command = require(path.join(dir, file));
                if (command.name && command.execute) {
                    commands.set(command.name, command);
                }
            }
        });
    };

    loadFromDir(mainDir);
    loadFromDir(pluginDir);

    console.log(`✅ Loaded ${commands.size} commands`);
    
    // Listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        let sender = m.key.remoteJid;
        let text = m.message.conversation || m.message.extendedTextMessage?.text;
        if (!text) return;

        if (!text.startsWith(config.prefix)) return;
        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();

        if (commands.has(cmdName)) {
            try {
                await commands.get(cmdName).execute(sock, m, args);
            } catch (err) {
                console.error("❌ Command Error:", err);
            }
        }
    });
}

module.exports = { loadCommands };
