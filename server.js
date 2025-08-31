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
        const { qr } = update;
        if (qr) qrString = qr;
    });
}

app.get("/", async (req, res) => {
    if (!qrString) return res.send("⏳ QR not generated yet...");
    const qrImg = await qrcode.toDataURL(qrString);
    res.send(`<h2>Scan this QR with WhatsApp</h2><img src="${qrImg}" />`);
});

app.listen(3000, () => {
    console.log("🌐 QR Server running on http://localhost:3000");
    startBot();
});
