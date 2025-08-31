const express = require("express");
const qrcode = require("qrcode");
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");

const app = express();
let qrString = "";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { qr, connection } = update;

        if (qr) qrString = qr;
        if (connection === "open") {
            console.log("✅ ZERA-X Connected to WhatsApp!");
        }
        if (connection === "close") {
            console.log("⚠️ Connection closed, restarting...");
            startBot();
        }
    });
}

// QR page
app.get("/", async (req, res) => {
    if (!qrString) return res.send("⏳ QR not generated yet, wait...");
    const qrImg = await qrcode.toDataURL(qrString);
    res.send(`<center><h2>📱 Scan this QR with WhatsApp to login ZERA-X</h2><br><img src="${qrImg}" /></center>`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🌐 QR Server running at http://localhost:3000");
    startBot();
});
