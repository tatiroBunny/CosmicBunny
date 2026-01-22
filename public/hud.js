const socket = io();
const hudId = new URLSearchParams(location.search).get("id");

if (!hudId) {
  document.body.innerHTML = "HUD sem ID";
  throw new Error("HUD ID ausente");
}

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {

  hudName.textContent = state.name || "Sem nome";
  hudLevel.textContent = state.level ? `Nv ${state.level}` : "";

  /* BARRAS */
  const vidaPct = state.vidaMax ? (state.vidaAtual / state.vidaMax) * 100 : 0;
  const manaPct = state.manaMax ? (state.manaAtual / state.manaMax) * 100 : 0;

  vidaBar.style.width = `${vidaPct}%`;
  manaBar.style.width = `${manaPct}%`;

  /* AVATAR */
  if (state.avatar) {
    document.documentElement.style.setProperty(
      "--avatar-url",
      `url(${state.avatar})`
    );
  }

  /* FRAME POR TEMA */
  document.body.dataset.theme = state.theme || "blood";
});
