// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { Server } from 'socket.io';
// import sequelize from './config/db.js';
// import userRoutes from './routes/userRoutes.js';
// import formRoutes from './routes/formRoutes.js';
// import { errorHandler } from './utils/errorHandler.js';
// import helmet from 'helmet'; // for security in production

// dotenv.config(); // Load environment variables

// const app = express();
// const port = process.env.PORT || 4000;

// // Middleware
// app.use(cors({ origin: 'http://localhost:5175' })); // Allow requests from React app
// app.use(express.json());
// app.use(helmet()); // Protect app from well-known vulnerabilities

// // Routes
// app.use("/", userRoutes); // User authentication routes
// app.use("/", formRoutes); // Form data routes

// // Error Handling Middleware (for catching errors in routes)
// app.use(errorHandler);

// // Socket.IO Setup
// const startServer = async () => {
//   try {
//     // ✅ Ensure database connection
//     await sequelize.authenticate();
//     console.log('Database connected successfully.');

//     // ✅ Sync models (only use `alter: true` if schema changes are expected)
//     await sequelize.sync({ alter: false });
//     console.log('Database synchronized successfully.');

//     // ✅ Start server after DB sync
//     const server = app.listen(port, () => {
//       console.log(`Server is up on port ${port}`);
//     });

//     const io = new Server(server, { cors: { origin: '*' } });

//     let online = 0;
//     let rooms = {}; // Object to hold rooms and their participants

//     io.on('connection', (socket) => {
//       online++;
//       io.emit('online', online);

//       // Handle starting a new call
//       socket.on('start', (cb) => handleStart(rooms, socket, cb, io));
//       socket.on('disconnect', () => {
//         online--;
//         io.emit('online', online);
//         handleDisconnect(socket.id, rooms, io);
//       });

//       // Handle ICE candidate exchange
//       socket.on('ice:send', ({ candidate }) => {
//         let type = getType(socket.id, rooms);
//         if (type) {
//           let remoteSocketId = type.type === 'p1' ? type.p2id : type.p1id;
//           if (remoteSocketId) io.to(remoteSocketId).emit('ice:reply', { candidate, from: socket.id });
//         }
//       });

//       // Handle SDP offer/answer exchange
//       socket.on('sdp:send', ({ sdp }) => {
//         let type = getType(socket.id, rooms);
//         if (type) {
//           let remoteSocketId = type.type === 'p1' ? type.p2id : type.p1id;
//           if (remoteSocketId) io.to(remoteSocketId).emit('sdp:reply', { sdp, from: socket.id });
//         }
//       });

//       // Handle user exiting the call
//       socket.on('exit', () => {
//         let type = getType(socket.id, rooms);
//         if (type) {
//           let remoteSocketId = type.type === 'p1' ? type.p2id : type.p1id;
//           if (remoteSocketId) io.to(remoteSocketId).emit('disconnected');
//         }
//         handleDisconnect(socket.id, rooms, io);
//         socket.disconnect(true);
//       });

//       // Handle messaging within a room
//       socket.on('send-message', (input, type, roomid) => {
//         const senderType = type === 'p1' ? 'You: ' : 'Stranger: ';
//         socket.to(roomid).emit('get-message', input, senderType);
//       });
//     });

//     // Function to handle starting a new call (room assignment)
//     function handleStart(rooms, socket, cb, io) {
//       let room = findAvailableRoom(rooms);
//       if (!room) {
//         room = createNewRoom(socket);
//       }

//       // Join the room
//       socket.join(room.id);

//       // Assign roles (p1 or p2)
//       if (room.p1 === null) {
//         room.p1 = socket.id;
//         socket.emit('remote-socket', room.p2); // Notify p1 about p2's socket
//       } else {
//         room.p2 = socket.id;
//         socket.emit('remote-socket', room.p1); // Notify p2 about p1's socket
//         io.to(room.p1).emit('remote-socket', room.p2); // Notify p1 about p2's socket
//         io.to(room.id).emit('roomid', room.id); // Notify both users of the room id
//       }

//       // Callback to send response after starting the room
//       if (cb) cb(room);
//     }

//     // Function to find an available room or return null
//     function findAvailableRoom(rooms) {
//       for (const roomId in rooms) {
//         const room = rooms[roomId];
//         if (room.p2 === null) return room; // Room is available for a new user
//       }
//       return null; // No available room
//     }

//     // Function to create a new room and assign participants
//     function createNewRoom(socket) {
//       const newRoom = {
//         id: `room-${Date.now()}`,
//         p1: socket.id,
//         p2: null,
//       };
//       rooms[newRoom.id] = newRoom;
//       return newRoom;
//     }

//     // Function to handle disconnection and cleanup
//     function handleDisconnect(socketId, rooms, io) {
//       // Find room where the user was connected
//       let roomId = null;
//       for (const id in rooms) {
//         const room = rooms[id];
//         if (room.p1 === socketId || room.p2 === socketId) {
//           roomId = id;
//           break;
//         }
//       }

//       if (roomId) {
//         const room = rooms[roomId];
//         if (room.p1 === socketId) {
//           io.to(room.p2).emit('disconnected'); // Notify the other user
//         } else if (room.p2 === socketId) {
//           io.to(room.p1).emit('disconnected'); // Notify the other user
//         }

//         // Clean up the room
//         delete rooms[roomId];
//       }
//     }

//     // Function to get type (p1 or p2) of a user in a room
//     function getType(socketId, rooms) {
//       for (const roomId in rooms) {
//         const room = rooms[roomId];
//         if (room.p1 === socketId) return { type: 'p1', p2id: room.p2 };
//         if (room.p2 === socketId) return { type: 'p2', p1id: room.p1 };
//       }
//       return null; // No type found for this socketId
//     }

//   } catch (error) {
//     console.error('Database connection failed:', error);
//     process.exit(1); // Exit the process if DB connection fails
//   }
// };

// // Start the server
// startServer();



import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import sequelize from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import formRoutes from './routes/formRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import helmet from 'helmet';
import FormData from './model/form.js';
import cohere from 'cohere-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5175","https://soul-megal-frontend.onrender.com"], // Allow multiple origins
    credentials: true, // Allow cookies if needed
  })
);
app.use(express.json());
app.use(helmet());

app.use("/user", userRoutes);
app.use("/form", formRoutes);
app.use(errorHandler);

// Socket.IO Setup
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const server = app.listen(port,'0.0.0.0', () => console.log(`Server running on port ${port}`));
    const io = new Server(server, { cors: { origin: '*' } });

    let onlineUsers = {};  // { userId: socketId }
    let userVectors = {};  // { userId: vector }
    let activeMatches = {};  // { userId: matchedUserId }

    // Function to compute cosine similarity between two vectors
    function cosineSimilarity(vecA, vecB) {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }

    // Function to find the best match based on vector similarity
    function findBestMatch(userId, userVector) {
      let bestMatch = null;
      let highestSimilarity = -1;

      for (const [otherUserId, vector] of Object.entries(userVectors)) {
        if (otherUserId !== userId) {
          const similarity = cosineSimilarity(userVector, vector);

          if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = otherUserId;
          }
        }
      }

      // If no strong match is found, return any available user
      return bestMatch || Object.keys(userVectors).find(id => id !== userId) || null;
    }

    // Socket.IO connection event
    io.on("connection", async (socket) => {
      const userId = socket.handshake.query.userId;
      if (!userId) return;

      onlineUsers[userId] = socket.id;

      let user = await FormData.findOne({ where: { userId } });

      // If user exists but has no vector, generate it using Cohere
      if (user && !user.vector) {
        const textData = `${user.hobbies}, ${user.gender}, ${user.education}, ${user.pets}, ${user.workout}, ${user.drinking}`;
        const response = await cohere.embed({
          model: "embed-english-v3.0", // The model you're using
          texts: [textData], // Text data to embed
          input_type: "classification", // Specify the input type if necessary
        });

        if (response.body.embeddings.length > 0) {
          user.vector = response.body.embeddings[0];
          await user.save(); // Save vector in DB
        }
      }

      // Store vector in memory if available
      if (user && user.vector) {
        userVectors[userId] = user.vector;
      }

      // Find best match for the user
      let matchId = findBestMatch(userId, user.vector);
      if (matchId) {
        const matchSocketId = onlineUsers[matchId];
        socket.emit("matched", { userId: matchId, socketId: matchSocketId });
        io.to(matchSocketId).emit("matched", { userId, socketId: socket.id });

        activeMatches[userId] = matchId;
        activeMatches[matchId] = userId;
      } else {
        socket.emit("no-match", "Searching...");
      }

      // Handle user disconnect event
      socket.on("disconnect", () => {
        delete onlineUsers[userId];
        delete userVectors[userId];
        delete activeMatches[userId];

        const matchId = activeMatches[userId];
        if (matchId) {
          delete activeMatches[matchId];
          io.to(onlineUsers[matchId]).emit("find-new-match");
        }
      });

      // Handle event to find a new match
      socket.on("find-new-match", async () => {
        let newMatch = findBestMatch(userId, userVectors[userId]);
        if (newMatch) {
          const matchSocketId = onlineUsers[newMatch];
          socket.emit("matched", { userId: newMatch, socketId: matchSocketId });
          io.to(matchSocketId).emit("matched", { userId, socketId: socket.id });

          activeMatches[userId] = newMatch;
          activeMatches[newMatch] = userId;
        } else {
          socket.emit("no-match", "No users available. Searching...");
        }
      });

      // Handle WebRTC signaling (SDP and ICE candidates)
      socket.on('sdp:send', async (data) => {
        const { sdp, to } = data;
        const peer = new RTCPeerConnection();
        peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('sdp:send', { sdp: peer.localDescription, to: to });
      });

      socket.on('ice:send', (data) => {
        const { candidate, to } = data;
        io.to(onlineUsers[to]).emit('ice:receive', candidate);
      });
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
