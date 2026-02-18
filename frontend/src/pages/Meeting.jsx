import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";

const Meeting = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // =========================
  // 🔹 Initialize Media SAFELY
  // =========================
  const initMedia = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const hasCamera = devices.some(d => d.kind === "videoinput");
      const hasMic = devices.some(d => d.kind === "audioinput");

      if (!hasCamera && !hasMic) {
        alert("No camera or microphone found.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: hasCamera,
        audio: hasMic,
      });

      setLocalStream(stream);     // ✅ store stream
      setIsStarted(true);         // ✅ render video elements

    } catch (err) {
      console.error("Media error:", err);

      if (err.name === "NotFoundError") {
        alert("Camera or microphone not connected.");
      } else if (err.name === "NotAllowedError") {
        alert("Permission denied. Please allow camera & mic.");
      } else {
        alert("Media device error occurred.");
      }
    }
  };

  // =========================
  // 🔹 Attach Stream AFTER Video Renders
  // =========================
  useEffect(() => {
    if (!localStream || !isStarted) return;

    // Attach local stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    // Create peer connection
    peerConnection.current = new RTCPeerConnection(servers);

    localStream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream);
    });

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId: groupId,
          candidate: event.candidate,
        });
      }
    };

  }, [localStream, isStarted]);

  // =========================
  // 🔹 Create Offer
  // =========================
  const createOffer = async () => {
    if (!peerConnection.current) return;

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", { roomId: groupId, offer });
  };

  // =========================
  // 🔹 Socket Events
  // =========================
  useEffect(() => {
    socket.emit("joinRoom", groupId);
    socket.emit("joinGroupRoom", groupId);
    socket.emit("registerUser", user?._id);

    socket.on("offer", async (offer) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", { roomId: groupId, answer });
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE error:", err);
      }
    });

    socket.on("userJoined", () => {
      createOffer();
    });

    socket.on("chatMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("userJoined");
      socket.off("chatMessage");
    };
  }, [groupId]);

  // =========================
  // 🔹 Controls
  // =========================
  const toggleMute = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = peerConnection.current
        ?.getSenders()
        .find(s => s.track?.kind === "video");

      sender?.replaceTrack(screenTrack);

      // When screen share stops, switch back
      screenTrack.onended = () => {
        const videoTrack = localStream?.getVideoTracks()[0];
        sender?.replaceTrack(videoTrack);
      };

    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const messageData = {
      user: user?.name || "User",
      text: chatInput,
    };

    socket.emit("chatMessage", { roomId: groupId, ...messageData });
    setMessages(prev => [...prev, messageData]);
    setChatInput("");
  };

  const leaveMeeting = () => {
    localStream?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    navigate("/group-study");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">

      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <h2 className="text-lg font-semibold">Meeting Room</h2>
        <button
          onClick={leaveMeeting}
          className="bg-red-600 px-4 py-1 rounded"
        >
          Leave
        </button>
      </div>

      <div className="flex flex-1">

        {/* Video Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!isStarted ? (
            <button
              onClick={initMedia}
              className="bg-green-600 px-6 py-2 rounded"
            >
              Start Camera
            </button>
          ) : (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-96 rounded-lg mb-4 bg-black"
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-96 rounded-lg bg-black"
              />
            </>
          )}
        </div>

        {/* Chat Section */}
        <div className="w-80 bg-gray-800 p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.user}: </strong> {msg.text}
              </div>
            ))}
          </div>

          <div className="flex">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-2 text-black rounded-l"
              placeholder="Type message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-3 rounded-r"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      {isStarted && (
        <div className="flex justify-center gap-4 p-4 bg-gray-800">
          <button onClick={toggleMute} className="bg-gray-700 px-4 py-2 rounded">
            {isMuted ? "Unmute" : "Mute"}
          </button>

          <button
            onClick={toggleCamera}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            {isCameraOff ? "Camera On" : "Camera Off"}
          </button>

          <button
            onClick={shareScreen}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Share Screen
          </button>
        </div>
      )}
    </div>
  );
};

export default Meeting;
