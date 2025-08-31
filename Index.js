/**
 * ZERA-X 2025 - Index.js (Main + QR Web Server)
 * Author: SATHANIC (ZERA-X TEAM)
 */

const express = require("express");
const qrcode = require("qrcode");
const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");

// Handlers
const { commandHandler } = require("./commandHandler");
const { eventHandler } = require("./eventHandler");
const { errorHandler } = require("./errorHandler");
const config = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = ""; // Global QR holder

async function startBot() {
    // ✅ Auth State
    const { state, saveCreds } = await useMultiFileAuthState("session");

    // ✅ WhatsApp Version
    const { version } = await fetchLatestBaileysVersion();

    // ✅ Create bot
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false, // ❌ We handle QR via Web
        browser: ["ZERA-X", "Chrome", "1.0.0"]
    });

    // ✅ Save creds
    sock.ev.on("creds.update", saveCreds);

    // ✅ Connection Handling
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = qr;
            console.log("📲 New QR generated, scan from web!");
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Disconnected:", reason);

            if (reason !== DisconnectReason.loggedOut) {
                console.log("♻️ Restarting bot...");
                startBot();
            } else {
                console.log("⚠️ Logged out. Delete session and re-scan QR.");
            }
        } else if (connection === "open") {
            console.log("✅ ZERA-X Connected Successfully!");
            qrCodeData = ""; // Clear QR
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

    // ✅ Group Events
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

    return sock;
}

// Start Bot
startBot();

// ✅ Web Route for QR
app.get("/", async (req, res) => {
    if (qrCodeData) {
        const qrImage = await qrcode.toDataURL(qrCodeData);
        res.send(`
            <html>
            <head><title>ZERA-X QR</title></head>
            <body style="text-align:center; font-family:sans-serif;">
                <h2>📱 Scan This QR to Connect ZERA-X</h2>
                <img src="${qrImage}" />
                <p>Refresh page if expired</p>
            </body>
            </html>
        `);
    } else {
        res.send("<h2>✅ ZERA-X Already Connected!</h2>");
    }
});

// Start Web Server
app.listen(PORT, () => {
    console.log(`🌍 ZERA-X QR Server running on http://localhost:${PORT}`);
});
