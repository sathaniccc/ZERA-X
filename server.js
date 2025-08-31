/**
 * ZERA-X 2025 - Server.js (QR Web Deployment + Direct Link)
 * Author: SATHANIC TEAM
 */

const express = require("express");
const qrcode = require("qrcode");
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = ""; // Global QR holder
let qrImageBase64 = ""; // Store QR as PNG (Base64)

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["ZERA-X", "Chrome", "1.0.0"]
    });

    // ✅ Save creds
    sock.ev.on("creds.update", saveCreds);

    // ✅ QR Handler
    sock.ev.on("connection.update", async (update) => {
        const { qr, connection } = update;
        if (qr) {
            qrCodeData = qr;
            qrImageBase64 = await qrcode.toDataURL(qr); // Save QR as image
            console.log("📲 New QR generated, scan from web!");
        }
        if (connection === "open") {
            console.log("✅ ZERA-X Connected Successfully!");
            qrCodeData = "";
            qrImageBase64 = "";
        }
    });

    return sock;
}

// Start bot
startBot();

// ✅ Web Route for QR (page view)
app.get("/", async (req, res) => {
    if (qrCodeData) {
        res.send(`
            <html>
            <head><title>ZERA-X QR</title></head>
            <body style="text-align:center; font-family:sans-serif;">
                <h2>📱 Scan This QR to Connect ZERA-X</h2>
                <img src="${qrImageBase64}" />
                <p><a href="/qr">➡️ Direct QR Link</a></p>
                <p>Refresh page if expired</p>
            </body>
            </html>
        `);
    } else {
        res.send("<h2>✅ ZERA-X Already Connected!</h2>");
    }
});

// ✅ Direct QR PNG Route
app.get("/qr", (req, res) => {
    if (qrImageBase64) {
        const base64Data = qrImageBase64.replace(/^data:image\/png;base64,/, "");
        const img = Buffer.from(base64Data, "base64");
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": img.length
        });
        res.end(img);
    } else {
        res.send("<h2>❌ No QR Available (Already Connected or Not Generated Yet)</h2>");
    }
});

// Start express server
app.listen(PORT, () => {
    console.log(`🌍 ZERA-X QR Server running on http://localhost:${PORT}`);
});
