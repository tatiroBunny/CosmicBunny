/* ===== SESSÃO ===== */
const sessionRaw = localStorage.getItem("COSMIC_SESSION");

if (!sessionRaw) {
  alert("Sessão não encontrada, voltando ao login.");
  window.location.href = "login.html";
}

const session = JSON.parse(sessionRaw);
const hudId = session.hudId;

/* ===== SOCKET ===== */
const socket = io();
socket.emit("joinHUD", hudId);

/* ===== ELEMENTOS ===== */
const openHudBtn = document.getElementById("openHudBtn");
const applyBtn = document.getElementById("applyBtn");

const charNameEl = document.getElementById("charName");
const charLevelEl = document.getElementById("charLevel");

const vidaAtualEl = document.getElementById("vidaAtual");
const vidaMaxEl = document.getElementById("vidaMax");

const manaAtualEl = document.getElementById("manaAtual");
const manaMaxEl = document.getElementById("manaMax");

const themeEl = document.getElementById("theme");
const hudIconEl = document.getElementById("hudIconInput");

if (!openHudBtn || !applyBtn) {
  console.error("Botões principais não encontrados no DOM");
}

/* ===== ABRIR HUD ===== */
openHudBtn.addEventListener("click", () => {
  const url = `hud.html?id=${encodeURIComponent(hudId)}`;
  console.log("Abrindo HUD:", url);
  window.open(url, "_blank");
});

/* ===== APLICAR ESTADO NO HUD ===== */
applyBtn.addEventListener("click", () => {
  const state = {
    name: charNameEl.value || "Sem Nome",
    level: Number(charLevelEl.value) || 1,

    vidaAtual: Number(vidaAtualEl.value),
    vidaMax: Number(vidaMaxEl.value),

    manaAtual: Number(manaAtualEl.value),
    manaMax: Number(manaMaxEl.value),

    /* 🔥 VISUAL */
    theme: themeEl?.value || "dark",
    icon: hudIconEl?.value?.trim() || null
  };

  console.log("📤 Enviando estado para HUD:", state);

  socket.emit("updateState", { hudId, state });
});
/* ===== SESSÃO ===== */
const sessionRaw = localStorage.getItem("COSMIC_SESSION");

if (!sessionRaw) {
  alert("Sessão não encontrada.");
  throw new Error("Sessão inexistente");
}

const session = JSON.parse(sessionRaw);
const hudId = session.hudId;

/* ===== SOCKET ===== */
const socket = io();
socket.emit("joinHUD", hudId);

/* ===== ELEMENTOS ===== */
const openHudBtn = document.getElementById("openHudBtn");
const applyBtn = document.getElementById("applyBtn");

/* ===== ABRIR HUD ===== */
openHudBtn.onclick = () => {
  window.open(`hud.html?id=${encodeURIComponent(hudId)}`, "_blank");
};

/* ===== APLICAR ===== */
applyBtn.onclick = () => {
  const vidaAtual = Number(document.getElementById("vidaAtual").value) || 0;
  const vidaMax   = Number(document.getElementById("vidaMax").value) || 0;

  const state = {
    name: document.getElementById("charName").value || "Sem Nome",
    level: Number(document.getElementById("charLevel").value) || 1,

    vidaAtual,
    vidaMax,

    theme: document.getElementById("theme").value || "dark",

    // 🔥 ÍCONE DO HUD
    iconUrl: document.getElementById("hudIconInput").value || null
  };

  socket.emit("updateState", { hudId, state });
};


