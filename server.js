import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// Estado em memória (por enquanto)
const characters = {};

// SOCKET.IO
io.on("connection", socket => {
  console.log("🔗 Conectado:", socket.id);

  socket.on("joinCharacter", charId => {
    socket.join(charId);

    if (characters[charId]) {
      socket.emit("syncState", characters[charId]);
    }
  });

  socket.on("updateState", ({ charId, data }) => {
    characters[charId] = data;
    socket.to(charId).emit("stateUpdated", data);
  });

  socket.on("rollDice", ({ charId, result }) => {
    socket.to(charId).emit("diceResult", result);
  });
});

server.listen(PORT, () => {
  console.log("🔥 Servidor rodando na porta", PORT);
});
