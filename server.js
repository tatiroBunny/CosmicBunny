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

/* ===============================
   ESTADO GLOBAL POR HUD ID
================================ */
const hudStates = {};

io.on("connection", socket => {
  socket.on("joinHUD", hudId => {
    socket.join(hudId);
    if (hudStates[hudId]) {
      socket.emit("stateSync", hudStates[hudId]);
    }
  });

  socket.on("updateState", ({ hudId, state }) => {
    hudStates[hudId] = state;
    socket.to(hudId).emit("stateSync", state);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("🔥 Cosmic Bunny online na porta", PORT)
);
