const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("Erro ao carregar página");
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  let currentRoom = null;

  socket.on("joinRoom", (room) => {
    if (!room) return;

    if (currentRoom) socket.leave(currentRoom);

    socket.join(room);
    currentRoom = room;

    console.log(`${socket.id} entrou na sala ${room}`);
  });

  socket.on("message", ({ room, message }) => {
    if (!room || !message) return;

    io.to(room).emit("message", {
      user: socket.id,
      message
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});