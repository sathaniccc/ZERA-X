module.exports = {
    // 🔹 Basic Settings
    prefix: ".",                   // Command prefix (.alive, .ping)
    owner: ["919778158839"],        // Owner numbers (array support)
    bot_name: "ZERA X",             // Bot name
    alive_message: "✅ I am Alive & Running 🚀", 

    // 🔹 API Keys (Free APIs)
    weather_api_key: "YOUR_OPENWEATHER_API_KEY",  // https://openweathermap.org/api
    joke_api: "https://official-joke-api.appspot.com/random_joke",
    quote_api: "https://api.quotable.io/random",

    // 🔹 Messages
    messages: {
        success: "✅ Done!",
        error: "❌ Something went wrong!",
        owner_only: "⚠️ This command is only for the owner!",
        admin_only: "⚠️ This command is only for admins!",
        group_only: "⚠️ This command can be used in groups only!",
        private_only: "⚠️ This command can be used in private chat only!",
    },

    // 🔹 Performance Settings
    auto_reconnect: true,          // Auto reconnect if disconnected
    max_cache: 1000,               // Max cache size
    log_level: "debug",            // debug | info | warn | error

    // 🔹 Design
    footer: "Powered by ZERA X 🔥",
    menu_emoji: "⚡",
};
