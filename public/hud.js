const socket = io();
const hudId = new URLSearchParams(window.location.search).get("id");

if (!hudId) {
  document.body.innerHTML = "HUD ID não informado";
}

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {
  vida.textContent = `❤️ ${state.vidaAtual}/${state.vidaMax}`;
  mana.textContent = `🔵 ${state.manaAtual}/${state.manaMax}`;
});
