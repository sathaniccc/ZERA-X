// utils/helpers.js
module.exports = {
  sleep: (ms) => new Promise(res => setTimeout(res, ms)),
  formatDate: (date) => new Date(date).toLocaleString(),
  randomId: () => Math.random().toString(36).substring(2, 10),
};
