/**
 * ZERA-X 2025 - API Handler
 * Author: SATHANIC (ZERA-X TEAM)
 */

const axios = require("axios");

// ✅ Example Free APIs
const API = {
    jokes: "https://v2.jokeapi.dev/joke/Any",
    quote: "https://api.quotable.io/random",
    dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en/",
    weather: "https://wttr.in/", // text weather
    news: "https://inshorts.deta.dev/news?category=", // example news
};

// ✅ Random Joke
async function getJoke() {
    try {
        let { data } = await axios.get(API.jokes);
        if (data.type === "single") return data.joke;
        else return `${data.setup}\n${data.delivery}`;
    } catch {
        return "❌ Joke API error.";
    }
}

// ✅ Random Quote
async function getQuote() {
    try {
        let { data } = await axios.get(API.quote);
        return `💡 "${data.content}" — *${data.author}*`;
    } catch {
        return "❌ Quote API error.";
    }
}

// ✅ Dictionary
async function getMeaning(word) {
    try {
        let { data } = await axios.get(API.dictionary + word);
        if (data[0]?.meanings) {
            return `📘 *${word}*: ${data[0].meanings[0].definitions[0].definition}`;
        } else return `No meaning found for ${word}`;
    } catch {
        return "❌ Dictionary error.";
    }
}

// ✅ Weather
async function getWeather(city) {
    try {
        let { data } = await axios.get(`${API.weather}${city}?format=3`);
        return `🌤️ Weather in ${city}: ${data}`;
    } catch {
        return "❌ Weather API error.";
    }
}

// ✅ News
async function getNews(category = "technology") {
    try {
        let { data } = await axios.get(API.news + category);
        if (data?.data?.length > 0) {
            return `📰 ${data.data[0].title}\n${data.data[0].content}`;
        }
        return "No news found.";
    } catch {
        return "❌ News API error.";
    }
}

module.exports = {
    getJoke,
    getQuote,
    getMeaning,
    getWeather,
    getNews,
};
