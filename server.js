const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

/* =========================
   SERVIR ARQUIVOS
========================= */
app.use(express.static("public"));

/* =========================
   FICHAS (PERSISTENTE)
========================= */
const FICHAS_FILE = path.join(__dirname, "fichas.json");
let fichas = {};

// carrega fichas ao iniciar
if (fs.existsSync(FICHAS_FILE)) {
  try {
    fichas = JSON.parse(fs.readFileSync(FICHAS_FILE, "utf8"));
    console.log("📂 Fichas carregadas:", Object.keys(fichas).length);
  } catch (e) {
    console.error("❌ Erro ao ler fichas.json", e);
  }
}

// salva fichas no disco
function salvarFichas() {
  fs.writeFileSync(FICHAS_FILE, JSON.stringify(fichas, null, 2));
}

/* =========================
   SOCKET.IO
========================= */
io.on("connection", socket => {
  console.log("🔌 Conectado:", socket.id);

  /* HUD */
  socket.on("joinHUD", hudId => {
    socket.join(hudId);
  });

  socket.on("updateState", ({ hudId, state }) => {
    io.to(hudId).emit("stateSync", state);
  });

  /* =====================
     FICHAS
  ===================== */

  // salvar ficha
  socket.on("saveFicha", ({ id, data }) => {
    fichas[id] = data;
    salvarFichas();
    socket.emit("fichaSaved", id);
  });

  // carregar ficha
  socket.on("loadFicha", id => {
    socket.emit("fichaData", fichas[id] || null);
  });

  // listar fichas (modo mestre)
  socket.on("listFichas", () => {
    socket.emit(
      "fichasList",
      Object.keys(fichas).map(id => ({
        id,
        nome: fichas[id]?.nome || "Sem nome"
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
