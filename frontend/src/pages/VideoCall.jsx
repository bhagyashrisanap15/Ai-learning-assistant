import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Video = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const [socket, setSocket] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  // =============================
  // CONNECT SOCKET
  // =============================
  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // =============================
  // START MEETING
  // =============================
const startMeeting = async () => {
  if (!socket) return;

  try {
    socket.emit("joinRoom", groupId);

    // First check available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasCamera = devices.some(d => d.kind === "videoinput");
    const hasMic = devices.some(d => d.kind === "audioinput");

    if (!hasCamera && !hasMic) {
      alert("No camera or microphone found on this device.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: hasCamera,
      audio: hasMic,
    });

    localStream.current = stream;
    localVideo.current.srcObject = stream;

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId: groupId,
          candidate: event.candidate,
        });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", { roomId: groupId, offer });

    setIsStarted(true);

  } catch (err) {
    console.error("Media Device Error:", err);

    if (err.name === "NotAllowedError") {
      alert("Camera permission denied. Please allow access.");
    } else if (err.name === "NotReadableError") {
      alert("Camera is already in use by another application.");
    } else {
      alert("Unable to access camera/microphone.");
    }
  }
};

  // =============================
  // SOCKET EVENTS
  // =============================
  useEffect(() => {
    if (!socket) return;

    socket.on("offer", async (offer) => {
      if (!peerConnection.current) {
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
      }

      await peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        roomId: groupId,
        answer,
      });
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerConnection.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE Candidate Error:", err);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, groupId]);

  // =============================
  // LEAVE MEETING
  // =============================
  const leaveMeeting = () => {
    // Stop camera
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    // Disconnect socket
    socket?.disconnect();

    navigate("/group-study");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Video Meeting</h1>

      <div className="flex gap-4">
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="w-1/2 rounded-lg bg-black"
        />
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className="w-1/2 rounded-lg bg-black"
        />
      </div>

      <div className="flex gap-4">
        {!isStarted ? (
          <button
            onClick={startMeeting}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={leaveMeeting}
            className="bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Leave Meeting
          </button>
        )}
      </div>
    </div>
  );
};

export default Video;
