module.exports = {
    name: "alive",
    description: "Check bot is alive",
    execute: async (sock, chat, args) => {
        await sock.sendMessage(chat, { text: "✅ ZERA X is Alive & Running 🚀" });
    }
};
