const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // reuse connection on warm Vercel invocations

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,  // fail fast — don't hang for 30s
    socketTimeoutMS: 10000,          // drop idle sockets after 10s
    maxPoolSize: 10,                 // keep connection pool small for serverless
  });

  isConnected = true;
  console.log(`✅ MongoDB Connected: ${conn.connection.name}`);
};

module.exports = connectDB;
