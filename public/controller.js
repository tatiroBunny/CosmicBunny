const socket = io();
const session = JSON.parse(localStorage.getItem("COSMIC_USER"));
const hudId = session.hudId;

socket.emit("joinHUD", hudId);

function aplicar() {
  const state = {
    vidaAtual: +vidaAtual.value,
    vidaMax: +vidaMax.value,
    manaAtual: +manaAtual.value,
    manaMax: +manaMax.value
  };

  socket.emit("updateState", { hudId, state });
}

function abrirHUD() {
  window.open(`hud.html?id=${hudId}`, "_blank");
}

