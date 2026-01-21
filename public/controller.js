const session = JSON.parse(localStorage.getItem("COSMIC_SESSION"));

if (!session) {
  window.location.href = "login.html";
}

const socket = io();
const hudId = session.hudId;

socket.emit("joinHUD", hudId);

/* ===== APLICAR ===== */
document.getElementById("applyBtn").addEventListener("click", () => {
  const state = {
    name: charName.value || "Sem Nome",
    level: Number(charLevel.value) || 1,

    vidaAtual: Number(vidaAtual.value),
    vidaMax: Number(vidaMax.value),

    manaAtual: Number(manaAtual.value),
    manaMax: Number(manaMax.value),

    theme: document.getElementById("theme")?.value || "dark"
  };

  socket.emit("updateState", { hudId, state });
});

/* ===== ABRIR HUD ===== */
document.getElementById("openHudBtn").addEventListener("click", () => {
  const url = `hud.html?id=${encodeURIComponent(hudId)}`;
  window.open(url, "_blank");
});
