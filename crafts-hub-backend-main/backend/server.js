// Load environment variables first — before any other require
require("dotenv").config();

// Local development only — Vercel uses api/index.js
const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
