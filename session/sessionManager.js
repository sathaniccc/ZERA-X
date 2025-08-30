                // 〘  Z E R A  X  〙

const fs = require("fs");
const crypto = require("crypto");
const file = "session/whatsappSession.json";
const secret = process.env.SESSION_KEY || "zera-secret";

function saveSession(session) {
  const encrypted = encrypt(JSON.stringify(session));
  fs.writeFileSync(file, encrypted);
}
function loadSession() {
  if (!fs.existsSync(file)) return null;
  const data = fs.readFileSync(file, "utf8");
  return JSON.parse(decrypt(data));
}
function encrypt(text) {
  const cipher = crypto.createCipher("aes-256-cbc", secret);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}
function decrypt(text) {
  const decipher = crypto.createDecipher("aes-256-cbc", secret);
  return decipher.update(text, "hex", "utf8") + decipher.final("utf8");
}
module.exports = { saveSession, loadSession };
