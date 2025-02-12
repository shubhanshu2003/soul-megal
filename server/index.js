import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { handelStart, handelDisconnect, getType } from './lib.js';
import sequelize from '../server/config/db.js';
import  User  from '../server/model/user.js';
import  FormData  from '../server/model/form.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from "path";
import url,{ fileURLToPath } from "url";


const app = express();
app.use(cors());
app.use(express.json()); // ✅ Middleware to parse JSON body

const startServer = async () => {
  try {
    // ✅ Ensure database connection
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // ✅ Sync models (only use `alter: true` if schema changes are expected)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // ✅ Start server after DB sync
    const server = app.listen(8000, () => {
      console.log('Server is up on port 8000');
    });

    const io = new Server(server, { cors: { origin: '*' } });

    let online = 0;
    let roomArr = [];

    io.on('connection', (socket) => {
      online++;
      io.emit('online', online);

      socket.on('start', (cb) => handelStart(roomArr, socket, cb, io));
      socket.on('disconnect', () => {
        online--;
        io.emit('online', online);
        handelDisconnect(socket.id, roomArr, io);
      });

      socket.on('ice:send', ({ candidate }) => {
        let type = getType(socket.id, roomArr);
        if (type) {
          let remoteSocketId = type.type === 'p1' ? type.p2id : type.p1id;
          if (remoteSocketId) io.to(remoteSocketId).emit('ice:reply', { candidate, from: socket.id });
        }
      });

      socket.on('sdp:send', ({ sdp }) => {
        let type = getType(socket.id, roomArr);
        if (type) {
          let remoteSocketId = type.type === 'p1' ? type.p2id : type.p1id;
          if (remoteSocketId) io.to(remoteSocketId).emit('sdp:reply', { sdp, from: socket.id });
        }
      });

      socket.on('exit', () => {
        let type = getType(socket.id, roomArr);
        if (type) {
          let remoteSocketId = type.type === 'p1' ? type.p2id : type.p1id;
          if (remoteSocketId) io.to(remoteSocketId).emit('disconnected');
        }
        handelDisconnect(socket.id, roomArr, io);
        socket.disconnect(true);
      });

      socket.on('send-message', (input, type, roomid) => {
        const senderType = type === 'p1' ? 'You: ' : 'Stranger: ';
        socket.to(roomid).emit('get-message', input, senderType);
      });
    });

    // ✅ Signup Route
    app.post("/signup", async (req, res) => {
      const { name, phone, email, password } = req.body;

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, phone, email, password: hashedPassword });

        res.status(201).json({ message: "User registered successfully", user: newUser });
      } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // ✅ Login Route
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
          return res.status(400).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ✅ Form Data Route
    app.post("/form-data", async (req, res) => {
      const { hobbies, gender, education, pets, workout, drinking, userId } = req.body;

      try {
        const formData = await FormData.create({ hobbies, gender, education, pets, workout, drinking, userId });
        res.status(201).json({ success: true, user: formData });
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//PRODUCTION
app.use(express.static(path.join(__dirname, "../soulmegal/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../soulmegal/dist", "index.html"));
});

startServer();
