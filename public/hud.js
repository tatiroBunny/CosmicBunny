const socket = io();
const hudId = new URLSearchParams(location.search).get("id");

if (!hudId) {
  document.body.innerHTML = "HUD sem ID";
  throw new Error("HUD ID ausente");
}

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {

  // Nome e nível
  hudName.textContent = state.name || "Sem nome";
  hudLevel.textContent = state.level || "1";

  // VIDA
  const vidaAtual = state.vidaAtual ?? 0;
  const vidaMax = state.vidaMax ?? 0;

  const perc = vidaMax ? Math.max(0, Math.min(vidaAtual / vidaMax, 1)) : 0;

  // cada lado é metade
  const scale = perc;

  vidaFillLeft.style.transform = `scaleX(${scale})`;
  vidaFillRight.style.transform = `scaleX(${scale})`;

  vidaText.textContent = `${vidaAtual} / ${vidaMax}`;

  // MANA
  const manaAtual = state.manaAtual ?? 0;
  const manaMax = state.manaMax ?? 0;
  manaText.textContent = `${manaAtual} / ${manaMax}`;

  // AVATAR
  if (state.avatar) {
    document.documentElement.style.setProperty(
      "--avatar-url",
      `url(${state.avatar})`
    );
  }

  // TEMA
  if (state.theme) {
    hudRoot.classList.remove("theme-dark", "theme-blood", "theme-arcane");
    hudRoot.classList.add(`theme-${state.theme}`);
  }
});
