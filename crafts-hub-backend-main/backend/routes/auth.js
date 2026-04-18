const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, groupName, location, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }
    if (!["buyer", "manufacturer"].includes(role)) {
      return res.status(400).json({ message: "Role must be buyer or manufacturer" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      groupName: role === "manufacturer" ? groupName || name : "",
      location: role === "manufacturer" ? location || "" : "",
      bio: role === "manufacturer" ? bio || "" : "",
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If role is provided, validate it matches
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as a ${user.role}. Please select the correct role.`,
      });
    }

    res.json({
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/me — get current user
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile — update profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, groupName, location, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (req.user.role === "manufacturer") {
      if (groupName !== undefined) updates.groupName = groupName;
      if (location !== undefined) updates.location = location;
      if (bio !== undefined) updates.bio = bio;
    }
    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ user: updated.toJSON() });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;
