import React, { useEffect, useRef } from "react";

const VideoCall = () => {
  const localVideoRef = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Show your camera on screen
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

      } catch (error) {
        console.error("Camera/Mic access denied:", error);
      }
    };

    startVideo();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Live Video Call</h1>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-96 h-64 bg-black rounded-lg"
      />
    </div>
  );
};

export default VideoCall;
