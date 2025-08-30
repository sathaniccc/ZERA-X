const config = require("./config");

function eventHandler(sock) {
    // 🔹 Connection update (QR / reconnect / close)
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("📸 Scan this QR to connect your bot");
        }
        if (connection === "close") {
            console.log("❌ Connection closed, reconnecting...");
            eventHandler(sock); // Auto reconnect
        } else if (connection === "open") {
            console.log(`✅ ${config.botName} connected successfully!`);
        }
    });

    // 🔹 Group participant update (join / leave)
    sock.ev.on("group-participants.update", async (update) => {
        try {
            const { id, participants, action } = update;
            let participant = participants[0];

            if (action === "add") {
                await sock.sendMessage(id, { text: `👋 Welcome @${participant.split("@")[0]}!`, mentions: [participant] });
            } else if (action === "remove") {
                await sock.sendMessage(id, { text: `😢 Goodbye @${participant.split("@")[0]}`, mentions: [participant] });
            }
        } catch (err) {
            console.error("❌ Event Error:", err);
        }
    });
}

module.exports = { eventHandler };
