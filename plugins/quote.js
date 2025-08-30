const { getQuote } = require("../api");

module.exports = {
    name: "quote",
    description: "Get a random quote",
    execute: async (sock, chat, args) => {
        const quote = await getQuote();
        await sock.sendMessage(chat, { text: `📖 ${quote}` });
    }
};
