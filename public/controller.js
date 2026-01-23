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

/* ===== ELEMENTOS (BLINDADO) ===== */
const openHudBtn = document.getElementById("openHudBtn");
const applyBtn = document.getElementById("applyBtn");

if (!openHudBtn || !applyBtn) {
  console.error("Botões não encontrados no DOM");
}

/* ===== ABRIR HUD ===== */
openHudBtn.addEventListener("click", () => {
  const url = `hud.html?id=${encodeURIComponent(hudId)}`;
  console.log("Abrindo HUD:", url);
  window.open(url, "_blank");
});

/* ===== APLICAR ===== */
applyBtn.addEventListener("click", () => {
  const state = {
    name: document.getElementById("charName").value || "Sem Nome",
    level: Number(document.getElementById("charLevel").value) || 1,

    vidaAtual: Number(document.getElementById("vidaAtual").value),
    vidaMax: Number(document.getElementById("vidaMax").value),

    manaAtual: Number(document.getElementById("manaAtual").value),
    manaMax: Number(document.getElementById("manaMax").value),

    theme: document.getElementById("theme").value || "dark"
  };

  socket.emit("updateState", { hudId, state });
});
