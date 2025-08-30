// media/mediaHandler.js
const fs = require("fs");
const sharp = require("sharp");

async function compressImage(input, output) {
  await sharp(input).resize(512).toFile(output);
  fs.unlinkSync(input);
}
module.exports = { compressImage };
