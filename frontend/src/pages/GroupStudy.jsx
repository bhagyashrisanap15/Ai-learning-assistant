import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Video, Plus, Users } from "lucide-react";

const socket = io("http://localhost:8000");

const GroupStudy = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef();

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await axios.get("http://localhost:8000/api/groups", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setGroups(res.data);
  };

  // Create Group
  const createGroup = async () => {
    await axios.post(
      "http://localhost:8000/api/groups/create",
      { name: groupName },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setGroupName("");
    fetchGroups();
  };

  // Join Group
  const joinGroup = async (roomId) => {
    setCurrentRoom(roomId);
    socket.emit("joinRoom", roomId);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideo.current.srcObject = stream;

    peerConnection.current = new RTCPeerConnection();

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer });
  };

  // Listen signaling
  useEffect(() => {
    socket.on("offer", async (offer) => {
      await peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        roomId: currentRoom,
        answer,
      });
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      await peerConnection.current.addIceCandidate(candidate);
    });
  }, [currentRoom]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Group Study</h1>

      {/* Create Group */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus size={18} /> Create Group
        </h2>

        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full p-2 border rounded-lg"
        />

        <button
          onClick={createGroup}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
        >
          Create Group
        </button>
      </div>

      {/* Available Groups */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users size={18} /> Available Groups
        </h2>

        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex justify-between items-center p-3 border rounded-lg"
            >
              <span>{group.name}</span>

              <button
                onClick={() => joinGroup(group._id)}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-lg"
              >
                <Video size={16} />
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Video Section */}
      {currentRoom && (
        <div className="flex gap-4 mt-6">
          <video
            ref={localVideo}
            autoPlay
            muted
            className="w-1/2 rounded-lg bg-black"
          />
          <video
            ref={remoteVideo}
            autoPlay
            className="w-1/2 rounded-lg bg-black"
          />
        </div>
      )}
    </div>
  );
};

export default GroupStudy;
