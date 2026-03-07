// Backend/config/config.js
export const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/kharcha-core',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // Security
  BCRYPT_ROUNDS: 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Pagination
  ITEMS_PER_PAGE: 50,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};

// Validate critical environment variables
const required = [
  process.env.NODE_ENV !== 'test' && 'JWT_SECRET',
  process.env.NODE_ENV !== 'test' && 'MONGODB_URI',
].filter(Boolean);

for (const key of required) {
  if (!process.env[key] && key !== false) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
  }
}

export default config;
