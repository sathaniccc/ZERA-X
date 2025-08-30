const { getWeather } = require("../api");
const { weather_api_key } = require("../config"); // API key config.js il add cheyyanam

module.exports = {
    name: "weather",
    description: "Get weather of a city",
    execute: async (sock, chat, args) => {
        if (args.length === 0) {
            return sock.sendMessage(chat, { text: "❗ Usage: .weather <city>" });
        }
        const city = args.join(" ");
        const report = await getWeather(city, weather_api_key);
        await sock.sendMessage(chat, { text: report });
    }
};
