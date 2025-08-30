const fs = require("fs");

module.exports = {
    name: "help",
    description: "Show all commands",
    execute: async (sock, chat, args) => {
        let commands = [];
        const folders = ["zera_main", "plugins"];
        for (const folder of folders) {
            const files = fs.readdirSync(`./${folder}`).filter(f => f.endsWith(".js"));
            for (const file of files) {
                const cmd = require(`../${folder}/${file}`);
                commands.push(`🔹 ${cmd.name} → ${cmd.description}`);
            }
        }
        await sock.sendMessage(chat, { text: `📜 *Available Commands*\n\n${commands.join("\n")}` });
    }
};
