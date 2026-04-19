const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle CORS and OPTIONS preflight BEFORE anything else (including DB)
app.use(cors(corsOptions));
app.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.status(204).end();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check — no DB needed
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// DB middleware — runs only for actual requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).json({ message: "Database unavailable. Please try again." });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/manufacturers", require("./routes/manufacturers"));

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  if (err.name === "MulterError") return res.status(400).json({ message: `Upload error: ${err.message}` });
  if (err.message?.startsWith("Image") || err.message?.startsWith("Video")) return res.status(400).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
