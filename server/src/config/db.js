import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI or MONGO_URL in your environment.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
}
