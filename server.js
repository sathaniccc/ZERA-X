/**
 * ZERA-X 2025 - Server.js (QR Web Deployment)
 * Author: SATHANIC TEAM
 */

const express = require("express");
const qrcode = require("qrcode");
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = ""; // Global QR holder

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false, // ❌ Don't print in terminal
        browser: ["ZERA-X", "Chrome", "1.0.0"]
    });

    // ✅ Save creds
    sock.ev.on("creds.update", saveCreds);

    // ✅ QR Handler
    sock.ev.on("connection.update", (update) => {
        const { qr, connection } = update;
        if (qr) {
            qrCodeData = qr;
            console.log("📲 New QR generated, scan from web!");
        }
        if (connection === "open") {
            console.log("✅ ZERA-X Connected Successfully!");
            qrCodeData = ""; // Clear QR after connection
        }
    });

    return sock;
}

// Start bot
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

// Start express server
app.listen(PORT, () => {
    console.log(`🌍 ZERA-X QR Server running on http://localhost:${PORT}`);
});
