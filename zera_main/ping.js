module.exports = {
    name: "ping",
    description: "Ping check",
    execute: async (sock, chat, args) => {
        const start = Date.now();
        await sock.sendMessage(chat, { text: "🏓 Pong!" });
        const end = Date.now();
        await sock.sendMessage(chat, { text: `⚡ Response: ${end - start}ms` });
    }
};
