import express from "express";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/all", protect, async (req, res) => {
  try {
    const users = await User.find().select("_id name email");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
