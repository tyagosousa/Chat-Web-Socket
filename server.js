const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// 👇 serve o HTML
app.use(express.static("public"));

io.on("connection", (socket) => {
  let currentRoom = null;

  socket.on("joinRoom", (room) => {
    if (currentRoom) socket.leave(currentRoom);

    socket.join(room);
    currentRoom = room;
  });

  socket.on("message", ({ room, message }) => {
    if (!room || !message) return;

    io.to(room).emit("message", {
      user: socket.id,
      message
    });
  });

  socket.on("typing", () => {
    if (!currentRoom) return;

    socket.to(currentRoom).emit("typing");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Rodando na porta", PORT);
});