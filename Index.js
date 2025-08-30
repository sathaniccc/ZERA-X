const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@adiwajshing/baileys");
const pino = require("pino");
const fs = require("fs");

const { loadCommands } = require("./commandHandler");
const { loadEvents } = require("./eventHandler");
const errorHandler = require("./errorHandler");
const config = require("./config");

async function startZeraX() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["ZERA X", "Chrome", "1.0.0"]
    });

    // Handlers
    loadCommands(sock);
    loadEvents(sock);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("⚠️ Connection closed, reconnecting...");
                startZeraX();
            } else {
                console.log("❌ Logged out. Delete session and rescan QR.");
            }
        } else if (connection === "open") {
            console.log("✅ ZERA X Connected Successfully!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        try {
            // Command handler already manages this
        } catch (err) {
            errorHandler(err, sock);
        }
    });
}

startZeraX();￼Enter
