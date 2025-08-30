/**
 * ZERA-X 2025 - Event Handler
 * Author: SATHANIC (ZERA-X TEAM)
 */

async function eventHandler(sock, update, config) {
    try {
        if (update?.announce) {
            console.log("📢 Group Announcement Changed:", update);
        }

        if (update?.participants) {
            for (let participant of update.participants) {
                if (update.action === "add") {
                    await sock.sendMessage(update.id, {
                        text: `👋 Welcome @${participant.split("@")[0]} to *${update.subject || "this group"}*!`,
                        mentions: [participant],
                    });
                } else if (update.action === "remove") {
                    await sock.sendMessage(update.id, {
                        text: `👋 Goodbye @${participant.split("@")[0]}!`,
                        mentions: [participant],
                    });
                } else if (update.action === "promote") {
                    await sock.sendMessage(update.id, {
                        text: `🔰 @${participant.split("@")[0]} promoted as *Admin*!`,
                        mentions: [participant],
                    });
                } else if (update.action === "demote") {
                    await sock.sendMessage(update.id, {
                        text: `⚡ @${participant.split("@")[0]} demoted from *Admin*!`,
                        mentions: [participant],
                    });
                }
            }
        }

        if (update?.subject) {
            await sock.sendMessage(update.id, {
                text: `📝 Group subject updated: *${update.subject}*`,
            });
        }
    } catch (err) {
        console.error("❌ Event Handler Error:", err);
    }
}

module.exports = { eventHandler };
