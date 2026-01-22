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

// carregar fichas ao iniciar
if (fs.existsSync(FICHAS_FILE)) {
  try {
    fichas = JSON.parse(fs.readFileSync(FICHAS_FILE, "utf8"));
    console.log("📂 Fichas carregadas:", Object.keys(fichas).length);
  } catch (e) {
    console.error("❌ Erro ao ler fichas.json", e);
    fichas = {};
  }
}

// salvar fichas
function salvarFichas() {
  fs.writeFileSync(FICHAS_FILE, JSON.stringify(fichas, null, 2));
}

// normaliza ID (SEGURANÇA)
function normalizarId(id) {
  if (!id) return null;
  id = String(id).trim();

  while (id.startsWith("FICHA_FICHA_")) {
    id = id.replace("FICHA_FICHA_", "FICHA_");
  }

  if (/^\d+$/.test(id)) {
    id = "FICHA_" + id;
  }

  return id.startsWith("FICHA_") ? id : null;
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
    const fichaId = normalizarId(id);
    if (!fichaId || !data) return;

    // GARANTE consistência
    data.id = fichaId;

    fichas[fichaId] = data;
    salvarFichas();

    console.log("💾 Ficha salva:", fichaId);
    socket.emit("fichaSaved", fichaId);
  });

  // carregar ficha
  socket.on("loadFicha", id => {
    const fichaId = normalizarId(id);
    const ficha = fichaId ? fichas[fichaId] : null;

    console.log(
      ficha
        ? `📤 Ficha enviada: ${fichaId}`
        : `⚠️ Ficha não encontrada: ${id}`
    );

    socket.emit("fichaData", ficha || null);
  });

  // listar fichas (modo mestre)
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
