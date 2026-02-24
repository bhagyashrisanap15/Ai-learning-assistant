import express from "express";
import {
  createGroup,
  getGroups,
  addMember,
  removeMember,
  deleteGroup,
   joinMeeting
} from "../controllers/groupController.js";

import protect from "../middleware/auth.js";

const router = express.Router();

// Create group
router.post("/create", protect, createGroup);

// Get all groups
router.get("/", protect, getGroups);

// Add member
router.put("/:groupId/add-member",protect, addMember);

router.post("/:groupId/join-meeting",protect, joinMeeting);

// Remove member
router.post("/remove-member", protect, removeMember);

// Delete group
router.delete("/delete/:id", protect, deleteGroup);

export default router;   // ✅ VERY IMPORTANT
