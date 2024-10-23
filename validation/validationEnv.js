const envalid = require('envalid');
const { str, port } = envalid;

const validateEnv = () => {
  return envalid.cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'test', 'production']
    }),
    PORT: port(),
    MONGODB_URI: str(),
    JWT_SECRET: str(),
    REDIS_URL: str({ default: 'redis://localhost:6379' })
  });
};

module.exports = validateEnv;