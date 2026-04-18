const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");

const router = express.Router();

// GET /api/manufacturers — all manufacturers (public)
router.get("/", async (req, res) => {
  try {
    const manufacturers = await User.find({ role: "manufacturer" }).select(
      "_id name groupName location bio avatarUrl createdAt"
    );
    res.json({ manufacturers });
  } catch (err) {
    res.status(500).json({ message: "Error fetching manufacturers" });
  }
});

// GET /api/manufacturers/:id — single manufacturer + their products
router.get("/:id", async (req, res) => {
  try {
    const manufacturer = await User.findOne({
      _id: req.params.id,
      role: "manufacturer",
    }).select("_id name groupName location bio avatarUrl createdAt");

    if (!manufacturer) return res.status(404).json({ message: "Manufacturer not found" });

    const products = await Product.find({ manufacturer: req.params.id }).sort({ createdAt: -1 });

    res.json({ manufacturer, products });
  } catch (err) {
    res.status(500).json({ message: "Error fetching manufacturer" });
  }
});

module.exports = router;
