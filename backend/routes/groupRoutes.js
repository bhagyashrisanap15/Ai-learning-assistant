import express from "express";
import Group from "../models/Group.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/create", protect, async (req, res) => {
  try {
    const group = await Group.create({
      name: req.body.name,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Failed to create group" });
  }
});

router.get("/", protect, async (req, res) => {
  const groups = await Group.find().populate("members", "name email");
  res.json(groups);
});

export default router;
