const socket = io();
const hudId = new URLSearchParams(window.location.search).get("id");

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {
  vida.innerText = `❤️ ${state.vidaAtual}/${state.vidaMax}`;
  mana.innerText = `🔵 ${state.manaAtual}/${state.manaMax}`;
});
