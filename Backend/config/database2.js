export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 10,
    });   
    // Monitor connection health
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    return conn;
  } catch (err) {
    logger.error('DB connection failed:', err);
    process.exit(1);
  }
}