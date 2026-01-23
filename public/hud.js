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
  const vidaPerc = vidaMax ? (vidaAtual / vidaMax) * 100 : 0;

  vidaBar.style.width = `${vidaPerc}%`;
  vidaText.textContent = `${vidaAtual}/${vidaMax}`;

  // MANA (SÓ TEXTO)
  const manaAtual = state.manaAtual ?? 0;
  const manaMax = state.manaMax ?? 0;
  manaText.textContent = `${manaAtual}/${manaMax}`;

  // Avatar
  if (state.avatar) {
    document.documentElement.style.setProperty(
      "--avatar-url",
      `url(${state.avatar})`
    );
  }
});
