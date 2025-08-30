// cache/cacheManager.js
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

module.exports = {
  set: (key, value, ttl) => cache.set(key, value, ttl),
  get: (key) => cache.get(key),
  del: (key) => cache.del(key),
  flush: () => cache.flushAll(),
};
