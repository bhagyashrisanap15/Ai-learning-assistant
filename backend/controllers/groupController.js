import Group from "../models/Group.js";
import { io } from "../server.js";


// ================================
// 🔹 CREATE GROUP
// ================================
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name: name.trim(),
      members: [req.user.id], // creator auto-added
    });

    const populatedGroup = await group.populate("members", "name email");

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 🔹 GET ALL GROUPS (Only User Groups)
// ================================
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
    }).populate("members", "name email");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 🔹 ADD MEMBER
// ================================
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only existing members can add new members
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent duplicate
    if (group.members.some(member => member.toString() === userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await group.populate("members", "name email");

    // 🔔 Real-time notification
    io.to(groupId).emit("memberAdded", {
      message: "A new member joined the group",
      userId,
      groupId,
    });

    res.json({
      message: "Member added successfully",
      group: updatedGroup,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 🔹 JOIN MEETING
// ================================
export const joinMeeting = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Ensure user is member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to join meeting" });
    }

    io.to(groupId).emit("userJoined", {
      message: `${req.user.name} joined the meeting`,
      userName: req.user.name,
      userId: req.user.id,
    });

    res.json({ message: "Joined meeting successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 🔹 REMOVE MEMBER
// ================================
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only existing members can remove
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );

    await group.save();

    const updatedGroup = await group.populate("members", "name email");

    io.to(groupId).emit("memberRemoved", {
      message: "A member was removed",
      userId,
      groupId,
    });

    res.json({
      message: "Member removed successfully",
      group: updatedGroup,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 🔹 DELETE GROUP
// ================================
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator (first member) can delete
    if (group.members[0].toString() !== req.user.id) {
      return res.status(403).json({ message: "Only creator can delete group" });
    }

    await group.deleteOne();

    io.to(groupId).emit("groupDeleted", {
      message: "Group has been deleted",
      groupId,
    });

    res.json({ message: "Group deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};