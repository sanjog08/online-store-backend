import mongoose from 'mongoose';
import app from '../src/app.js';
import config from '../src/config.js';

/**
 * Reuse the MongoDB connection across warm serverless invocations.
 * Vercel may keep the same Node.js instance alive for multiple requests,
 * so we only connect once and cache the state.
 */
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  isConnected = true;
};

/**
 * Serverless entry point.
 * Ensures the DB is connected on every cold start, then delegates
 * the request to the Express app.
 */
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
