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

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    const res = await axios.get(`${API}/groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGroups(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  };

  const createGroup = async () => {
    await axios.post(
      `${API}/groups/create`,
      { name: groupName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setGroupName("");
    fetchGroups();
  };

  const addMembers = async (groupId) => {
    for (let userId of selectedUsers) {
      await axios.post(
        `${API}/groups/add-member`,
        { groupId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
   socket.emit("memberAdded", {
      groupId,
      userId,
      message: "You have been added to a new group!",
    });
  }
    setSelectedUsers([]);
    fetchGroups();
  };

  const removeMember = async (groupId, userId) => {
    await axios.post(
      `${API}/groups/remove-member`,
      { groupId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchGroups();
  };

  const deleteGroup = async (groupId) => {
    await axios.delete(`${API}/groups/delete/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchGroups();
  };

  const joinGroup = (groupId) => {
    navigate(`/video/${groupId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Group Study</h1>

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

      {groups.map((group) => (
        <div key={group._id} className="bg-white p-6 rounded-xl shadow-md space-y-4">
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

          <div>
            <h3 className="font-medium mb-2">Members:</h3>
            {group.members?.map((member) => (
              <div
                key={member._id}
                className="flex justify-between items-center border p-2 rounded-lg"
              >
                <span>{member.name} ({member.email})</span>

                <button
                  onClick={() => removeMember(group._id, member._id)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

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
