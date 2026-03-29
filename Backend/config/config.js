export const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/kharcha-core',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRE: '7d',

  // Clerk Authentication
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY||"sk_test_ZChxk3ZcyGCOAlCAoGmyQnA2jfPKnzgpjPKhnCTJIv",

  // Security
  BCRYPT_ROUNDS: 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  // Pagination
  ITEMS_PER_PAGE: 50,
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
};