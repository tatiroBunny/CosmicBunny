const socket = io();
const hudId = new URLSearchParams(window.location.search).get("id");

let lastHP = null;

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {

  // Nome e nível
  hudName.textContent = state.name;
  hudLevel.textContent = `Nv ${state.level}`;

  // Texto
  vidaText.textContent = `${state.vidaAtual}/${state.vidaMax}`;
  manaText.textContent = `${state.manaAtual}/${state.manaMax}`;

  // Barra de vida
  const percent = (state.vidaAtual / state.vidaMax) * 100;
  vidaFill.style.width = `${percent}%`;

  // Animações
  if (lastHP !== null) {
    if (state.vidaAtual < lastHP) {
      hud.classList.add("hud-damage");
    } else if (state.vidaAtual > lastHP) {
      hud.classList.add("hud-heal");
    }

    setTimeout(() => {
      hud.classList.remove("hud-damage", "hud-heal");
    }, 600);
  }

  lastHP = state.vidaAtual;
});
