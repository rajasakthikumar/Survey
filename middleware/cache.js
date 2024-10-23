const redis = require('redis');
const { promisify } = require('util');
const config = require('../config/environment');

const client = redis.createClient(config.redisUrl);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const cache = (duration) => {
  return async (req, res, next) => {
    if (config.env === 'development') return next();

    const key = `__express__${req.originalUrl}`;
    const cachedResponse = await getAsync(key);

    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }

    res.originalJson = res.json;
    res.json = async (body) => {
      await setAsync(key, JSON.stringify(body), 'EX', duration);
      res.originalJson(body);
    };

    next();
  };
};

module.exports = cache;