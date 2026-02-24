import express from "express";
import {
  createGroup,
  getGroups,
  addMember,
  removeMember,
  deleteGroup,
  joinMeeting,
} from "../controllers/groupController.js";

import protect from "../middleware/auth.js";

const router = express.Router();

// Create group
router.post("/", protect, createGroup);

// Get all groups
router.get("/", protect, getGroups);

// Add member
router.put("/:groupId/members", protect, addMember);

// Remove member
router.delete("/:groupId/members/:userId", protect, removeMember);

// Delete group
router.delete("/:groupId", protect, deleteGroup);

// Join meeting
router.post("/:groupId/join", protect, joinMeeting);

export default router;