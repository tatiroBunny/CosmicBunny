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
   FICHAS NO SERVIDOR
========================= */
const fichas = {}; // memória (Render free não persiste disco)

/* =========================
   SOCKET
========================= */
io.on("connection", socket => {
  console.log("🔌 Conectado:", socket.id);

  // salvar ficha (jogador)
  socket.on("saveFicha", ({ id, data }) => {
    if (!id || !data) return;

    fichas[id] = data;
    console.log("💾 Ficha salva:", id);

    socket.emit("fichaSaved", id);
  });

  // carregar ficha (mestre ou jogador)
  socket.on("loadFicha", id => {
    const ficha = fichas[id] || null;
    socket.emit("fichaData", ficha);
  });

  // listar fichas (select do jogador)
  socket.on("listFichas", () => {
    socket.emit(
      "fichasList",
      Object.values(fichas).map(f => ({
        id: f.id,
        nome: f.nome || "Sem nome"
      }))
    );
  });
});

/* =========================
   START
========================= */
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
