const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

/* =========================
   SERVIR ARQUIVOS
========================= */
app.use(express.static("public"));

/* =========================
   SOCKET.IO
========================= */
io.on("connection", socket => {
  console.log("🔌 Conectado:", socket.id);

  /* =====================
     HUD (INALTERADO)
  ===================== */
  socket.on("joinHUD", hudId => {
    socket.join(hudId);
  });

  socket.on("updateState", ({ hudId, state }) => {
    io.to(hudId).emit("stateSync", state);
  });

  /* =====================
     FICHAS (P2P)
  ===================== */

  // Mestre pede uma ficha por ID
  socket.on("requestFicha", fichaId => {
    if (!fichaId) return;

    console.log("📥 Pedido de ficha:", fichaId);

    // envia o pedido para TODOS os outros clientes
    socket.broadcast.emit("requestFicha", fichaId);
  });

  // Jogador responde com a ficha
  socket.on("sendFicha", payload => {
    if (!payload || !payload.id || !payload.data) return;

    console.log("📤 Ficha recebida:", payload.id);

    // envia para TODOS (mestre incluso)
    io.emit("receiveFicha", payload);
  });
});

/* =========================
   START
========================= */
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
