const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,       // e.g. https://crafts-hub-frontend.vercel.app
  "http://localhost:5173",      // Vite dev server
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle pre-flight OPTIONS for every route
app.options("*", cors());

// ─── BODY PARSERS ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── DB CONNECTION ───────────────────────────────────────────────────────────
// Called once per cold start; the isConnected guard in config/db.js prevents
// re-connecting on warm Vercel invocations.
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/manufacturers", require("./routes/manufacturers"));

// Health check — verify the deployment is alive
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// 404 — unknown route
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
// Catches errors forwarded via next(err), including multer file-size/type errors.
// Must have exactly 4 parameters so Express treats it as an error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);

  // Multer errors (file too large, wrong mimetype, etc.)
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  // Custom upload errors thrown by toBase64()
  if (err.message?.startsWith("Image") || err.message?.startsWith("Video")) {
    return res.status(400).json({ message: err.message });
  }

  // CORS rejection
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  // Default 500
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
