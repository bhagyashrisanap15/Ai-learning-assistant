import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, Video, Trash } from "lucide-react";
import socket from "../socket";

const API = "http://localhost:8000/api";

const GroupStudy = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // =============================
  // FETCH DATA
  // =============================
  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (error) {
      console.error("Fetch groups error:", error.response?.data || error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Fetch users error:", error.response?.data || error.message);
    }
  };

  // =============================
  // CREATE GROUP
  // =============================
  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      await axios.post(
        `${API}/groups`,
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGroupName("");
      fetchGroups();
    } catch (error) {
      console.error("Create group error:", error.response?.data || error.message);
    }
  };

  // =============================
  // ADD MEMBERS
  // =============================
  const addMembers = async (groupId) => {
    try {
      for (let userId of selectedUsers) {
        await axios.put(
          `${API}/groups/${groupId}/members`,
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setSelectedUsers([]);
      fetchGroups();
    } catch (error) {
      console.error("Add member error:", error.response?.data || error.message);
    }
  };

  // =============================
  // REMOVE MEMBER
  // =============================
  const removeMember = async (groupId, userId) => {
    try {
      await axios.delete(
        `${API}/groups/${groupId}/members/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchGroups();
    } catch (error) {
      console.error("Remove member error:", error.response?.data || error.message);
    }
  };

  // =============================
  // DELETE GROUP
  // =============================
  const deleteGroup = async (groupId) => {
    try {
      await axios.delete(
        `${API}/groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchGroups();
    } catch (error) {
      console.error("Delete group error:", error.response?.data || error.message);
    }
  };

  // =============================
  // JOIN GROUP (VIDEO)
  // =============================
  const joinGroup = (groupId) => {
    socket.emit("joinGroupRoom", groupId);
    navigate(`/video/${groupId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Group Study</h1>

      {/* ================= CREATE GROUP ================= */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus size={18} /> Create Group
        </h2>

        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />

        <button
          onClick={createGroup}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
        >
          Create
        </button>
      </div>

      {/* ================= GROUP LIST ================= */}
      {groups.map((group) => (
        <div
          key={group._id}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{group.name}</h2>

            <div className="flex gap-3">
              <button
                onClick={() => joinGroup(group._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg"
              >
                <Video size={16} />
              </button>

              <button
                onClick={() => deleteGroup(group._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>

          {/* ================= MEMBERS ================= */}
          <div>
            <h3 className="font-medium mb-2">Members:</h3>
            {group.members?.map((member) => (
              <div
                key={member._id}
                className="flex justify-between items-center border p-2 rounded-lg"
              >
                <span>
                  {member.name} ({member.email})
                </span>

                <button
                  onClick={() =>
                    removeMember(group._id, member._id)
                  }
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ================= ADD MEMBERS ================= */}
          <div className="flex gap-2">
            <select
              multiple
              size={5}
              value={selectedUsers}
              onChange={(e) =>
                setSelectedUsers(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="w-full p-2 border rounded-lg h-32 overflow-y-auto"
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>

            <button
              onClick={() => addMembers(group._id)}
              className="bg-emerald-500 text-white px-3 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupStudy;