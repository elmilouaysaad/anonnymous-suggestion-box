const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const findEnvBySuffix = (suffix) => {
  const matched = Object.entries(process.env).find(([key, value]) =>
    key.endsWith(suffix) && Boolean(value)
  );
  return matched ? matched[1] : undefined;
};

const resolveEnv = (...keys) => {
  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key];
    }
  }

  return undefined;
};

const connectionUrl = resolveEnv(
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL'
) || findEnvBySuffix('_POSTGRES_URL');

const dbName = resolveEnv('DB_NAME', 'POSTGRES_DATABASE') || findEnvBySuffix('_POSTGRES_DATABASE');
const dbUser = resolveEnv('DB_USER', 'POSTGRES_USER') || findEnvBySuffix('_POSTGRES_USER');
const dbPassword =
  resolveEnv('DB_PASSWORD', 'POSTGRES_PASSWORD') || findEnvBySuffix('_POSTGRES_PASSWORD');
const dbHost = resolveEnv('DB_HOST', 'POSTGRES_HOST') || findEnvBySuffix('_POSTGRES_HOST');
const dbPort = resolveEnv('DB_PORT', 'POSTGRES_PORT') || findEnvBySuffix('_POSTGRES_PORT') || '5432';

const shouldUseSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  process.env.NODE_ENV === 'production';

const commonConfig = {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: shouldUseSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {}
};

const sequelize = connectionUrl
  ? new Sequelize(connectionUrl, commonConfig)
  : new Sequelize(dbName, dbUser, dbPassword, {
      ...commonConfig,
      host: dbHost,
      port: dbPort
    });

module.exports = sequelize;
