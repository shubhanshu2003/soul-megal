

import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);

document.addEventListener('DOMContentLoaded', () => {
  const myVideo = document.getElementById('my-video');
  const strangerVideo = document.getElementById('video');
  const button = document.getElementById('send');
  const exitButton = document.getElementById('exit');
  const inputField = document.querySelector('input');
  const chatWrapper = document.querySelector('.chat-holder .wrapper');

  let peer;
  let remoteSocket;
  let type;
  let roomid;

  // Socket event handlers
  socket.on('online', (onlineCount) => {
    console.log('Users online: ', onlineCount);
  });

  socket.on('roomid', (id) => {
    roomid = id;
  });

  socket.on('disconnected', () => {
    alert('Your chat partner has left.');
    closeVideoCall();
  });

  socket.on('get-message', (message) => {
    chatWrapper.innerHTML += `
      <div class="msg">
        <b>Stranger: </b> <span>${message}</span>
      </div>
    `;
  });

  // Handle exit button click
  exitButton.addEventListener('click', () => {
    closeVideoCall();
    socket.emit('exit'); // Notify the backend user is exiting
    roomid = null; // Clear room id
    startCall(); // Allow the user to start a new call
  });

  // Start media capture
  function startMediaCapture() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        myVideo.srcObject = stream;
        myVideo.play();

        if (peer) {
          stream.getTracks().forEach(track => peer.addTrack(track, stream));

          peer.ontrack = e => {
            strangerVideo.srcObject = e.streams[0];
            strangerVideo.play();
          };
        }
      })
      .catch(err => console.error("Media capture error:", err));
  }

  // Start the WebRTC connection
  function startCall() {
    socket.emit('start', (person) => {
      type = person;
    });

    socket.on('remote-socket', (id) => {
      remoteSocket = id;
      document.querySelector('.modal').style.display = 'none';

      peer = new RTCPeerConnection();
      peer.onnegotiationneeded = async () => {
        await handleWebRTC();
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('ice:send', { candidate: e.candidate, to: remoteSocket });
        }
      };

      startMediaCapture();
    });
  }

  // Handle WebRTC offer and answer
  async function handleWebRTC() {
    if (type === 'p1') {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('sdp:send', { sdp: peer.localDescription, to: remoteSocket });
    }
  }

  // Send message
  button.addEventListener('click', () => {
    const input = inputField.value.trim();
    if (!input) return;

    socket.emit('send-message', input, type, roomid);

    chatWrapper.innerHTML += `
      <div class="msg">
        <b>You: </b> <span>${input}</span>
      </div>
    `;
    inputField.value = '';
  });

  // Start the call when the page loads
  startCall();
});

