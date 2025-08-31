/**
 * ZERA-X 2025 - Server.js (QR Web Deployment)
 * Author: SATHANIC TEAM
 */

const express = require("express");
const qrcode = require("qrcode");
const fs = require("fs");
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = ""; // Global QR holder

// 🗑️ Delete old session before start (fresh QR each time)
if (fs.existsSync("session")) {
    fs.rmSync("session", { recursive: true, force: true });
    console.log("🗑️ Old session deleted, fresh QR will be generated.");
}

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
            <head>
                <title>ZERA-X QR</title>
                <meta http-equiv="refresh" content="15"> <!-- 🔄 Auto refresh every 15 sec -->
                <style>
                    body { text-align:center; font-family:sans-serif; background:#111; color:#fff; }
                    img { margin-top:20px; border:5px solid #fff; border-radius:10px; }
                    button { padding:10px 20px; font-size:16px; margin-top:20px; cursor:pointer; border:none; background:#0f0; border-radius:8px; }
                </style>
            </head>
            <body>
                <h2>📱 Scan This QR to Connect ZERA-X</h2>
                <img src="${qrImage}" />
                <p>⚡ Refresh page if expired</p>
                <form method="get" action="/">
                    <button type="submit">🔄 Generate New QR</button>
                </form>
            </body>
            </html>
        `);
    } else {
        res.send("<h2 style='text-align:center; font-family:sans-serif;'>✅ ZERA-X Already Connected!</h2>");
    }
});

// Start express server
app.listen(PORT, () => {
    console.log(`🌍 ZERA-X QR Server running on http://localhost:${PORT}`);
});
