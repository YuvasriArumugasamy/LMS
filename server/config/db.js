import mongoose from 'mongoose';
import { runAutoSeed } from '../utils/seed.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri && process.env.VERCEL === '1') {
    console.warn('[MongoDB Warning] MONGODB_URI environment variable is missing on Vercel.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/elms_enterprise', {
      serverSelectionTimeoutMS: 4000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    runAutoSeed().catch((err) => console.error('[AutoSeed Error]', err));
  } catch (error) {
    console.error(`[MongoDB Error] Connection Failed: ${error.message}`);
    console.warn('[MongoDB Warning] Operating with fallback memory state if DB is unreachable.');
  }
};
