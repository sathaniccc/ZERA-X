/**
 * ZERA-X 2025 - Error Handler
 * Author: SATHANIC (ZERA-X TEAM)
 */

const fs = require("fs");
const path = require("path");

function logError(error, context = "General") {
    const logDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    const logFile = path.join(logDir, "errors.log");
    const timestamp = new Date().toISOString();

    const errorMsg = `[${timestamp}] [${context}] ${error?.stack || error}\n`;

    fs.appendFileSync(logFile, errorMsg, "utf8");

    console.error("❌ Error:", errorMsg);
}

function errorHandler(sock) {
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            logError(lastDisconnect?.error, "Connection Closed");
        }
    });

    process.on("uncaughtException", (err) => logError(err, "Uncaught Exception"));
    process.on("unhandledRejection", (reason) => logError(reason, "Unhandled Rejection"));
}

module.exports = { errorHandler, logError };
