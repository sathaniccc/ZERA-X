const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs", "error.log");

// 🔹 Error log function
function logError(error) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${error.stack || error}\n`;

    // Save to logs/error.log
    fs.appendFileSync(logFile, message, "utf8");
    console.error("❌ Error logged:", error.message || error);
}

// 🔹 Attach global error handlers
function handleErrors() {
    process.on("uncaughtException", (err) => {
        logError(err);
    });

    process.on("unhandledRejection", (reason, promise) => {
        logError(reason);
    });
}

module.exports = { handleErrors, logError };
