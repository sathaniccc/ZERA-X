// utils/helpers.js
module.exports = {
  getTime: () => new Date().toLocaleString(),
  isUrl: (text) => /(https?:\/\/[^\s]+)/g.test(text),
};
