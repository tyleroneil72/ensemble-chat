import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_message", (data) => {
    // Broadcast message to everyone except sender
    const { username, profilePhoto, message } = data;
    console.log(`Message received: ${message} from ${username}`);
    console.log(`Profile photo: ${profilePhoto}`);

    socket.broadcast.emit("receive_message", {
      username,
      profilePhoto,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
