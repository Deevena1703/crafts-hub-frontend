const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // reuse existing connection in serverless

  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is not set");
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error; // let the request fail with 500, don't kill the process
  }
};

module.exports = connectDB;
