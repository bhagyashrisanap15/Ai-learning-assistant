import Group from "../models/Group.js";
import { io } from "../server.js";


// ================================
// 🔹 CREATE GROUP
// ================================
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name,
      members: [req.user.id], // creator auto-added
    });

    const populatedGroup = await group.populate("members", "name email");

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 🔹 GET ALL GROUPS
// ================================
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("members", "name email");
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

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await group.populate("members", "name email");

    // 🔔 Notify group members via socket
    io.to(groupId).emit("notification", {
      message: "New member added to the group",
      userId,
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
// 🔹 USER JOIN MEETING
// ================================
export const joinMeeting = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ message: "User name is required" });
    }

    // 🔔 Notify group members
    io.to(groupId).emit("userJoined", {
      message: `${userName} joined the meeting`,
      userName,
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

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );

    await group.save();

    const updatedGroup = await group.populate("members", "name email");

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
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await group.deleteOne();

    res.json({ message: "Group deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
