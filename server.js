/**
 * ZERA-X 2025 - Server.js (QR Web Deployment + Bot Link)
 * Author: SATHANIC TEAM
 */

const express = require("express");
const qrcode = require("qrcode");
const fs = require("fs");
const { startBot } = require("./index.js"); // 🔗 index.js link
const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = ""; // Global QR holder

// ✅ Call Bot from index.js
startBot((qr, status) => {
    if (qr) {
        qrCodeData = qr; // save QR
        console.log("📲 New QR generated, scan from web!");
    }
    if (status === "open") {
        qrCodeData = ""; // clear qr after connection
        console.log("✅ ZERA-X Connected Successfully!");
    }
});

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
