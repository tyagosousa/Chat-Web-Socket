const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  let currentRoom = null;

  socket.on("joinRoom", (room) => {
    if (currentRoom) {
      socket.leave(currentRoom);
    }

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

  socket.on("typing", () => {
    if (!currentRoom) return;

    socket.to(currentRoom).emit("typing", {
      user: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});
