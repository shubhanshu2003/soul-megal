// import { useEffect, useRef } from "react";
// import "./video.css";

// function Video() {
//   const myVideoRef = useRef(null);
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (myVideoRef.current) {
//       navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//         myVideoRef.current.srcObject = stream;
//       });
//     }
//   }, []);

//   return (
//     <div>
//       <div className="modal">
//         <span id="spinner">Waiting For Someone...</span>
//       </div>

//       <div className="video-holder">
//         <video autoPlay ref={myVideoRef} id="my-video"></video>
//         <video autoPlay ref={videoRef} id="video"></video>
//       </div>

//       <div className="chat-holder">
//         <div className="wrapper"></div>
//         <div className="input">
//           <input type="text" placeholder="Type your message here.." />
//           <button id="send">Send</button>
//           <button id="exit">Exit</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Video;

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./video.css";

const socket = io("http://localhost:10000");

function Video() {
  const myVideoRef = useRef(null);
  const videoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomid, setRoomid] = useState(null);
  const [peer, setPeer] = useState(null);
  const [remoteSocket, setRemoteSocket] = useState(null);
  const [type, setType] = useState("");

  // Get user media (local video/audio)
  useEffect(() => {
    if (myVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myVideoRef.current.srcObject = stream;
      });
    }

    // Socket event handlers
    socket.on("roomid", (id) => {
      setRoomid(id);
    });

    socket.on("disconnected", () => {
      alert("Your chat partner has left.");
      closeVideoCall();
    });

    socket.on("get-message", (message) => {
      setMessage((prevMessages) => `${prevMessages}\nStranger: ${message}`);
    });

    socket.on("remote-socket", (id) => {
      setRemoteSocket(id);
      startCall();
    });

    return () => {
      socket.off("roomid");
      socket.off("disconnected");
      socket.off("get-message");
      socket.off("remote-socket");
    };
  }, []);

  // Update remote video when stream is available
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle WebRTC signaling
  const startCall = () => {
    socket.emit("start", (person) => {
      setType(person);
    });
    const newPeer = new RTCPeerConnection();
    newPeer.onnegotiationneeded = async () => {
      await handleWebRTC(newPeer);
    };
    newPeer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice:send", { candidate: e.candidate, to: remoteSocket });
      }
    };
    setPeer(newPeer);
  };

  const handleWebRTC = async (newPeer) => {
    if (type === "p1") {
      const offer = await newPeer.createOffer();
      await newPeer.setLocalDescription(offer);
      socket.emit("sdp:send", { sdp: newPeer.localDescription, to: remoteSocket });
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("send-message", message, type, roomid);
      setMessage(""); // Clear message input
    }
  };

  // Handle exit logic
  const handleExit = () => {
    if (myVideoRef.current.srcObject) {
      const tracks = myVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    socket.emit("exit");
  };

  return (
    <div>
      {/* <div className="modal">
        <span id="spinner">Waiting For Someone...</span>
      </div> */}

      <div className="video-holder">
        <video autoPlay ref={myVideoRef} id="my-video"></video>
        <video autoPlay ref={videoRef} id="video"></video>
      </div>

      <div className="chat-holder">
        <div className="wrapper">{message}</div>
        <div className="input">
          <input
            type="text"
            placeholder="Type your message here.."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button id="send" onClick={handleSendMessage}>Send</button>
          <button id="exit" onClick={handleExit}>Exit</button>
        </div>
      </div>
    </div>
  );
}

export default Video;
