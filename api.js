const axios = require("axios");

// 🔹 Random Joke API
async function getJoke() {
    try {
        const res = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single");
        return res.data.joke || "😅 No joke found!";
    } catch (err) {
        return "❌ API Error (Joke)";
    }
}

// 🔹 Random Quote API
async function getQuote() {
    try {
        const res = await axios.get("https://api.quotable.io/random");
        return `"${res.data.content}" — ${res.data.author}`;
    } catch (err) {
        return "❌ API Error (Quote)";
    }
}

// 🔹 Weather API (OpenWeatherMap) → need API key
async function getWeather(city, apiKey) {
    try {
        const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const w = res.data;
        return `🌤️ ${w.name}, ${w.sys.country}\nTemp: ${w.main.temp}°C\nCondition: ${w.weather[0].description}`;
    } catch (err) {
        return "❌ API Error (Weather)";
    }
}

module.exports = { getJoke, getQuote, getWeather };
