const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect, requireRole } = require("../middleware/auth");
const { upload, toBase64 } = require("../middleware/upload");

const router = express.Router();

// ─── HELPER ──────────────────────────────────────────────────────────────────
// Validates a MongoDB ObjectId and returns a 400 response if invalid.
// Prevents CastError crashes when someone passes a non-ObjectId string.
const validateObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid ID format" });
    return false;
  }
  return true;
};

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// GET /api/products — all products (with filter/search/pagination)
router.get("/", async (req, res) => {
  try {
    const { category, search, manufacturerId, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category && category !== "all") query.category = category;
    if (manufacturerId) {
      if (!mongoose.Types.ObjectId.isValid(manufacturerId)) {
        return res.status(400).json({ message: "Invalid manufacturerId format" });
      }
      query.manufacturer = manufacturerId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { manufacturerName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("manufacturer", "name groupName location bio avatarUrl"),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// ─── MANUFACTURER ONLY ROUTES ─────────────────────────────────────────────────
// IMPORTANT: These specific string routes MUST come before /:id so Express
// doesn't match "my" as an ObjectId and throw a CastError.

// GET /api/products/my/products — current manufacturer's own products
router.get("/my/products", protect, requireRole("manufacturer"), async (req, res) => {
  try {
    const products = await Product.find({ manufacturer: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Error fetching your products" });
  }
});

// POST /api/products — create a new product (with photo/video upload)
router.post(
  "/",
  protect,
  requireRole("manufacturer"),
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const { name, description, price, category } = req.body;
      if (!name || !price || !category) {
        return res.status(400).json({ message: "name, price and category are required" });
      }

      // Convert uploaded photos to base64 data-URIs
      const photoUploads = [];
      if (req.files?.photos) {
        for (const file of req.files.photos) {
          photoUploads.push(toBase64(file)); // throws if file exceeds per-type limit
        }
      }

      // Convert uploaded video to base64 data-URI
      let videoUpload = null;
      if (req.files?.video?.[0]) {
        videoUpload = toBase64(req.files.video[0]);
      }

      const product = await Product.create({
        name,
        description: description || "",
        price: Number(price),
        category,
        photos: photoUploads,
        video: videoUpload,
        manufacturer: req.user._id,
        manufacturerName: req.user.groupName || req.user.name,
      });

      res.status(201).json({ product });
    } catch (err) {
      // Forward toBase64 size errors and unexpected errors to global handler
      next(err);
    }
  }
);

// ─── ROUTES WITH :id PARAM ────────────────────────────────────────────────────
// These come AFTER all fixed-string routes to avoid shadowing them.

// GET /api/products/:id — single product
router.get("/:id", async (req, res) => {
  if (!validateObjectId(req.params.id, res)) return;
  try {
    const product = await Product.findById(req.params.id).populate(
      "manufacturer",
      "name groupName location bio avatarUrl"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// PUT /api/products/:id — update product (manufacturer's own only)
router.put(
  "/:id",
  protect,
  requireRole("manufacturer"),
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res, next) => {
    if (!validateObjectId(req.params.id, res)) return;
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      // Ownership check — manufacturers can only edit their own products
      if (product.manufacturer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to edit this product" });
      }

      const { name, description, price, category, removePhotoIds, removeVideo } = req.body;

      if (name) product.name = name;
      if (description !== undefined) product.description = description;
      if (price) product.price = Number(price);
      if (category) product.category = category;

      // Remove specific photos by ID
      if (removePhotoIds) {
        const idsToRemove = Array.isArray(removePhotoIds) ? removePhotoIds : [removePhotoIds];
        product.photos = product.photos.filter((p) => !idsToRemove.includes(p._id.toString()));
      }

      // Add new photos as base64
      if (req.files?.photos) {
        for (const file of req.files.photos) {
          product.photos.push(toBase64(file));
        }
      }

      // Remove video
      if (removeVideo === "true") product.video = null;

      // Replace/add video as base64
      if (req.files?.video?.[0]) {
        product.video = toBase64(req.files.video[0]);
      }

      await product.save();
      res.json({ product });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/products/:id — delete product (manufacturer's own only)
router.delete("/:id", protect, requireRole("manufacturer"), async (req, res) => {
  if (!validateObjectId(req.params.id, res)) return;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.manufacturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
