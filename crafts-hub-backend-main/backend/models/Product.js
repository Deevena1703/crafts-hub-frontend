const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  dataUri: { type: String, required: true }, // base64 data-URI stored directly in MongoDB
  type: { type: String, enum: ["image", "video"], required: true },
  name: { type: String, default: "" },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["pottery", "textiles", "jewelry", "paintings", "baskets", "other"],
      required: true,
    },
    // Media files stored in Firebase Storage
    photos: [mediaSchema],
    video: { type: mediaSchema, default: null },
    // Manufacturer reference — isolated per manufacturer
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    manufacturerName: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text search index
productSchema.index({ name: "text", description: "text", manufacturerName: "text" });

module.exports = mongoose.model("Product", productSchema);
