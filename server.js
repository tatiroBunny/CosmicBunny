const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", socket => {
  console.log("🔌 Conectado:", socket.id);

  /* =====================
     SALAS DE MESTRE
  ===================== */

  socket.on("joinMestre", mestreId => {
    if (!mestreId) return;
    socket.join(mestreId);
    console.log(`🎭 Socket ${socket.id} entrou na sala ${mestreId}`);
  });

  /* =====================
     PEDIDO DE FICHA
  ===================== */

  socket.on("requestFicha", ({ fichaId, mestreId }) => {
    if (!fichaId || !mestreId) return;

    console.log(`📥 Mestre ${mestreId} pediu ficha ${fichaId}`);

    // pede para todos os jogadores
    socket.broadcast.emit("requestFicha", { fichaId, mestreId });
  });

  /* =====================
     RESPOSTA DO JOGADOR
  ===================== */

  socket.on("sendFicha", ({ fichaId, data, mestreId }) => {
    if (!fichaId || !data || !mestreId) return;

    console.log(`📤 Ficha ${fichaId} enviada para mestre ${mestreId}`);

    // envia SOMENTE para o mestre certo
    io.to(mestreId).emit("receiveFicha", {
      id: fichaId,
      data
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
