import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Connect Database
connectDB();

// =======================
// ✅ Middlewares
// =======================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// ✅ Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/users", userRoutes);

// =======================
// ✅ Socket.IO Logic
// =======================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔹 Join group room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // 🔹 Register user private room
  socket.on("registerUser", (userId) => {
    socket.join(userId); // each user joins their own private room
  });

  // 🔹 Notify specific member
  socket.on("memberAdded", ({ userId, message }) => {
    io.to(userId).emit("notifyMember", { message });
  });

  // 🔹 WebRTC Signaling
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // 🔹 Join group room (for meeting)
  socket.on("joinGroupRoom", (groupId) => {
    socket.join(groupId);
    console.log(`Socket joined group room: ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// =======================
// ✅ Error Handler
// =======================
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// =======================
// ✅ Start Server
// =======================
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
