/**
 * ZERA-X 2025 - Main Bot File
 * Author: SATHANIC (ZERA-X TEAM)
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");

// Handlers
const { commandHandler } = require("./commandHandler");
const { eventHandler } = require("./eventHandler");
const { errorHandler } = require("./errorHandler");
const config = require("./config");

async function startBot() {
    // ✅ Auth State (multi-file session)
    const { state, saveCreds } = await useMultiFileAuthState("session");

    // ✅ Get latest WhatsApp version
    const { version } = await fetchLatestBaileysVersion();

    // ✅ Create bot socket
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        browser: ["ZERA-X", "Chrome", "1.0.0"]
    });

    // ✅ Session auto-save
    sock.ev.on("creds.update", saveCreds);

    // ✅ Connection handling
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = new DisconnectReason(lastDisconnect?.error?.output?.statusCode);
            console.log("❌ Disconnected:", reason);

            if (reason !== DisconnectReason.loggedOut) {
                console.log("♻️ Restarting bot...");
                startBot(); // Auto restart
            } else {
                console.log("⚠️ Logged out. Delete session and re-scan QR.");
            }
        } else if (connection === "open") {
            console.log("✅ ZERA-X Connected Successfully!");
        }
    });

    // ✅ Message Handler
    sock.ev.on("messages.upsert", async (msg) => {
        try {
            await commandHandler(sock, msg, config);
        } catch (err) {
            errorHandler(err, msg);
        }
    });

    // ✅ Events (group updates, participants, etc.)
    sock.ev.on("group-participants.update", async (event) => {
        try {
            await eventHandler(sock, event, config);
        } catch (err) {
            errorHandler(err, event);
        }
    });

    // ✅ Auto Plugins Loader
    const pluginsDir = path.join(__dirname, "plugins");
    fs.readdirSync(pluginsDir).forEach((plugin) => {
        if (plugin.endsWith(".js")) {
            require(path.join(pluginsDir, plugin))(sock, config);
            console.log(`📦 Plugin Loaded: ${plugin}`);
        }
    });
}

// Start the bot
startBot();
