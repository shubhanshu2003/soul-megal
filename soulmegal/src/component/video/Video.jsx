import { useEffect, useRef } from "react";
import "./Video.css";

function Video() {
  const myVideoRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (myVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myVideoRef.current.srcObject = stream;
      });
    }
  }, []);

  return (
    <div>
      <div className="modal">
        <span id="spinner">Waiting For Someone...</span>
      </div>

      <div className="video-holder">
        <video autoPlay ref={myVideoRef} id="my-video"></video>
        <video autoPlay ref={videoRef} id="video"></video>
      </div>

      <div className="chat-holder">
        <div className="wrapper"></div>
        <div className="input">
          <input type="text" placeholder="Type your message here.." />
          <button id="send">Send</button>
          <button id="exit">Exit</button>
        </div>
      </div>
    </div>
  );
}

export default Video;
