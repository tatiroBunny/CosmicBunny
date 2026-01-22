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
   FICHAS (SERVER = FONTE)
========================= */

const FICHAS_FILE = path.join(__dirname, "fichas.json");
let fichas = {};

// carrega ao iniciar
if (fs.existsSync(FICHAS_FILE)) {
  try {
    fichas = JSON.parse(fs.readFileSync(FICHAS_FILE, "utf8"));
    console.log("📂 Fichas carregadas:", Object.keys(fichas).length);
  } catch {
    fichas = {};
  }
}

// salva no disco
function salvarFichas() {
  fs.writeFileSync(FICHAS_FILE, JSON.stringify(fichas, null, 2));
}

// normaliza ID
function normalizarId(id) {
  if (!id) return null;
  id = String(id).trim();

  while (id.startsWith("FICHA_FICHA_")) {
    id = id.replace("FICHA_FICHA_", "FICHA_");
  }

  if (/^\d+$/.test(id)) id = "FICHA_" + id;
  return id.startsWith("FICHA_") ? id : null;
}

/* =========================
   SOCKET.IO
========================= */
io.on("connection", socket => {
  console.log("🔌 Conectado:", socket.id);

  /* =====================
     HUD (FUNCIONAL)
  ===================== */

  socket.on("joinHUD", hudId => {
    socket.join(hudId);
    console.log("🎯 HUD join:", hudId);
  });

  socket.on("updateState", ({ hudId, state }) => {
    if (!hudId) return;
    io.to(hudId).emit("stateSync", state);
  });

  /* =====================
     FICHAS (SERVER DIRECT)
  ===================== */

  socket.on("saveFicha", ({ id, data }) => {
    const fichaId = normalizarId(id);
    if (!fichaId || !data) return;

    data.id = fichaId;
    fichas[fichaId] = data;
    salvarFichas();

    socket.emit("fichaSaved", fichaId);
    console.log("💾 Ficha salva:", fichaId);
  });

  socket.on("loadFicha", id => {
    const fichaId = normalizarId(id);
    const ficha = fichaId ? fichas[fichaId] : null;

    socket.emit("fichaData", ficha || null);

    console.log(
      ficha
        ? `📤 Ficha enviada: ${fichaId}`
        : `⚠️ Ficha não encontrada: ${id}`
    );
  });

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
