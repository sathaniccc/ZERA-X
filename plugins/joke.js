const { getJoke } = require("../api");

module.exports = {
    name: "joke",
    description: "Get a random joke",
    execute: async (sock, chat, args) => {
        const joke = await getJoke();
        await sock.sendMessage(chat, { text: `😂 ${joke}` });
    }
};
