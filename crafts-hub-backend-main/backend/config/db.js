const mongoose = require("mongoose");

const connectDB = async () => {
  // Use mongoose's own readyState instead of a custom flag
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState >= 1) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    maxPoolSize: 10,
  });

  console.log(`✅ MongoDB Connected: ${conn.connection.name}`);
};

module.exports = connectDB;