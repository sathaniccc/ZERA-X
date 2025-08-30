module.exports = {
    name: "about",
    description: "About ZERA X",
    execute: async (sock, chat, args) => {
        const msg = `
🤖 *ZERA X BOT*
Created by: Your Name  
Powered by: Node.js  

Type *.help* to see available commands.
        `;
        await sock.sendMessage(chat, { text: msg });
    }
};
