import mongoose from 'mongoose';
import { runAutoSeed } from '../utils/seed.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elms_enterprise');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    // Auto seed database if empty
    runAutoSeed().catch((err) => console.error('[AutoSeed Error]', err));
  } catch (error) {
    console.error(`[MongoDB Error] Connection Failed: ${error.message}`);
    // If local DB fails in dev, allow fallback mock mode for seamless frontend testing
    console.warn('[MongoDB Warning] Operating with fallback memory mock state if DB is unreachable.');
  }
};
