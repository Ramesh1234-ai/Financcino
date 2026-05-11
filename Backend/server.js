import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { config } from './config/config.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import budgetRoutes from './routes/budgets.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import receiptsRoutes from './routes/receipts.routes.js';
import publicRoutes from './routes/public.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
// Load environment variables
dotenv.config();
const app = express();
const PORT = config.PORT;
const MONGODB_URI = config.MONGODB_URI;
const NODE_ENV = config.NODE_ENV;
const JWT_SECRET=config.JWT_SECRET;
// ==================== MIDDLEWARE ====================

// Security middleware
app.use(helmet()); // Set secure HTTP headers

// CORS middleware - Support multiple origins in development
const corsOrigins = NODE_ENV === 'production'
  ? [config.CORS_ORIGIN]
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 3600, // Preflight cache time in seconds
};

app.use(cors(corsOptions));

// Additional CORS headers middleware as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  next();
});

// Body parsing middleware
// For webhooks: capture raw body before JSON parsing for signature verification
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }));

// Standard body parsing for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(requestLogger);

// ==================== SWAGGER SETUP ====================
// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api-docs.json',
  },
}));

// Serve swagger spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ==================== DATABASE CONNECTION ====================
async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Monitor connection events
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error:', err);
    });

    return conn;
  } catch (err) {
    logger.error('Database connection failed:', err);
    process.exit(1);
  }
}

// ==================== ROUTES ====================
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/receipts', receiptsRoutes);
// Public routes (no authentication required)
app.use('/api/public', publicRoutes);
// Webhook routes (Clerk user sync)
app.use('/api/webhooks', webhookRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
    },
  });
});
// Error handling middleware (MUST be last)
app.use(errorHandler);
// ==================== SERVER STARTUP ====================
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();
    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(`
        ========================================
        ✅ Server running in ${NODE_ENV} mode
        📍 Listening on port ${PORT}
        🌐 API Base URL: http://localhost:${PORT}/api
        📚 Swagger UI: http://localhost:${PORT}/api-docs
        🏥 Health Check: http://localhost:${PORT}/api/health
        ❤️ Jwt Secret Key :${JWT_SECRET} 
        ========================================
      `);
    });
    // Graceful shutdown
    function gracefulShutdown() {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await mongoose.connection.close();
        logger.info('✓ Server closed, database connection closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('💥 Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000); // 30 second timeout
    }
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('💥 Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('💥 Unhandled Rejection:', reason);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}
// Start the server
startServer();
export default app;