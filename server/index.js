


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
    origin: [`${process.env.FRONTEND_URL}`], // Allow multiple origins
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
