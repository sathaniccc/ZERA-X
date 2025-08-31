/**
 * ZERA-X — Single Entry (replaces index.js + server.js)
 * MD-ready (Baileys 2025), QR + Pairing Code, Menu (button/list), Alive, Ping
 * Auto plugin loader: ./plugins + ./zera_main
 * Prefix, owner etc. from ./config.js
 */

const express = require("express");
const QRCode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const config = require("./config");

// -------------------- tiny web keepalive + QR endpoint --------------------
const app = express();
const PORT = process.env.PORT || 3000;
let lastQR = null;

app.get("/", (_, res) =>
  res.send(
    `<h1>ZERA-X</h1><p>Status OK</p><p>QR: <a href="/qr">/qr</a></p>`
  )
);
app.get("/qr", async (_, res) => {
  if (!lastQR) return res.send("QR not generated yet.");
  const dataUrl = await QRCode.toDataURL(lastQR, { margin: 1, scale: 6 });
  res.send(`<img src="${dataUrl}" alt="qr"/><p>Scan in WhatsApp > Linked devices</p>`);
});
app.listen(PORT, () =>
  console.log(chalk.cyan(`[ZERA-X] Keepalive @ http://localhost:${PORT}`))
);

// -------------------- Plugin loader --------------------
const commands = new Map();
const aliases = new Map();

function loadDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .forEach((file) => {
      const full = path.join(dir, file);
      delete require.cache[require.resolve(full)];
      const mod = require(full);
      if (!mod || !mod.name || typeof mod.run !== "function") return;
      commands.set(mod.name.toLowerCase(), mod);
      (mod.aliases || []).forEach((a) => aliases.set(a.toLowerCase(), mod.name.toLowerCase()));
    });
}

function loadPlugins() {
  commands.clear();
  aliases.clear();
  loadDir(path.join(__dirname, "zera_main"));
  loadDir(path.join(__dirname, "plugins"));
  // inject core built-ins (alive/ping/menu/help/about) if not provided by files
  if (!commands.has("alive")) commands.set("alive", coreAlive);
  if (!commands.has("ping")) commands.set("ping", corePing);
  if (!commands.has("menu")) commands.set("menu", coreMenu);
  if (!commands.has("help")) commands.set("help", coreMenu);
  if (!commands.has("about")) commands.set("about", coreAbout);
  console.log(chalk.green(`[ZERA-X] Loaded ${commands.size} commands.`));
}

// -------------------- Core commands --------------------
const coreAlive = {
  name: "alive",
  aliases: [],
  category: "core",
  desc: "Bot status",
  run: async (sock, m) => {
    await sock.sendMessage(m.key.remoteJid, {
      text: `✅ *ZERA-X* is alive!\n• Prefix: ${config.prefix}\n• Owner: ${config.owner?.[0] || ""}`,
    });
  },
};

const corePing = {
  name: "ping",
  aliases: [],
  category: "core",
  desc: "Latency check",
  run: async (sock, m) => {
    const t0 = performance.now();
    const sent = await sock.sendMessage(m.key.remoteJid, { text: "Pinging..." });
    const t1 = performance.now();
    await sock.sendMessage(m.key.remoteJid, {
      edit: sent.key,
      text: `🏓 Pong: *${(t1 - t0).toFixed(0)}ms*`,
    });
  },
};

const coreAbout = {
  name: "about",
  aliases: ["credits"],
  category: "core",
  desc: "About the bot",
  run: async (sock, m) => {
    await sock.sendMessage(m.key.remoteJid, {
      text: `🤖 *ZERA-X* — Multi-Device Bot\n🔧 ${commands.size} cmds loaded\n👑 Owner: ${config.owner?.[0] || ""}`,
    });
  },
};

const coreMenu = {
  name: "menu",
  aliases: ["help", "list"],
  category: "core",
  desc: "Show all commands (dynamic)",
  run: async (sock, m) => {
    // group by category
    const groups = {};
    for (const [, cmd] of commands) {
      const cat = (cmd.category || "misc").toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd.name);
    }

    // build text
    let text = `*ZERA-X Menu* (${commands.size} cmds)\n`;
    Object.keys(groups)
      .sort()
      .forEach((cat) => {
        text += `\n• *${cat.toUpperCase()}*\n`;
        text += "  " + groups[cat].sort().map((n) => config.prefix + n).join(", ") + "\n";
      });

    // send as listMessage (latest style) when supported
    try {
      const sections = Object.keys(groups).sort().map((cat) => ({
        title: cat.toUpperCase(),
        rows: groups[cat]
          .sort()
          .map((n) => ({ title: `${config.prefix}${n}`, rowId: `${config.prefix}${n}` })),
      }));

      await sock.sendMessage(m.key.remoteJid, {
        text,
        footer: "ZERA-X • dynamic menu",
      });

      // If you prefer WhatsApp list message UI instead of plain text, uncomment:
      // await sock.sendMessage(m.key.remoteJid, { listMessage: {
      //   title: "ZERA-X Menu",
      //   description: "Choose a command",
      //   buttonText: "Open Menu",
      //   sections
      // }});
    } catch {
      await sock.sendMessage(m.key.remoteJid, { text });
    }
  },
};

// -------------------- Parser --------------------
function getBody(msg) {
  const m = msg.message || {};
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ""
  );
}

async function handleMessage(sock, msg) {
  const body = getBody(msg);
  const prefix = config.prefix || ".";
  if (!body.startsWith(prefix)) return;

  const args = body.slice(prefix.length).trim().split(/\s+/);
  const name = (args.shift() || "").toLowerCase();

  const cmdName = commands.has(name)
    ? name
    : aliases.has(name)
    ? aliases.get(name)
    : null;

  if (!cmdName) return;

  try {
    await commands.get(cmdName).run(sock, msg, args, { config });
  } catch (e) {
    console.error(e);
    await sock.sendMessage(msg.key.remoteJid, { text: "❌ Error executing command." });
  }
}

// -------------------- Boot --------------------
async function boot() {
  loadPlugins();

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName || "session");
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true, // prints nice terminal QR
    browser: ["ZERA-X", "Chrome", "1.0"],
    markOnlineOnConnect: false,
  });

  // Pairing-code mode (optional)
  sock.ev.on("connection.update", async (u) => {
    const { connection, qr, lastDisconnect } = u;

    if (qr) {
      lastQR = qr;
      qrcodeTerminal.generate(qr, { small: true });
      console.log(chalk.yellow(`Scan QR or open /qr in browser`));
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.message;
      console.log(chalk.red(`[ZERA-X] Disconnected: ${reason}. Reconnecting...`));
      if (reason !== DisconnectReason.loggedOut) setTimeout(boot, 1500);
    } else if (connection === "open") {
      console.log(chalk.green(`[ZERA-X] Connected ✅`));
      // Pairing code (if requested and not registered)
      if (
        process.env.PAIR_MODE === "1" &&
        !sock.authState.creds?.registered &&
        process.env.PAIR_PHONE
      ) {
        try {
          const code = await sock.requestPairingCode(process.env.PAIR_PHONE);
          console.log(chalk.cyan(`🔗 Pair this device: ${code}`));
        } catch (e) {
          console.log("Pairing code error:", e?.message);
        }
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message || m.key.fromMe) return;
    handleMessage(sock, m);
  });

  // Basic group events (welcome/left). Extend if needed in eventHandler.js too
  sock.ev.on("group-participants.update", async (ev) => {
    try {
      const jid = ev.id;
      if (ev.action === "add") {
        await sock.sendMessage(jid, { text: `👋 Welcome ${ev.participants.join(", ")}` });
      } else if (ev.action === "remove") {
        await sock.sendMessage(jid, { text: `👋 Bye ${ev.participants.join(", ")}` });
      }
    } catch {}
  });

  // Hot-reload plugins on file change (dev convenience)
  if (process.env.HOT_RELOAD === "1") {
    fs.watch(path.join(__dirname, "plugins"), { recursive: true }, () => loadPlugins());
    fs.watch(path.join(__dirname, "zera_main"), { recursive: true }, () => loadPlugins());
  }
}

boot();
