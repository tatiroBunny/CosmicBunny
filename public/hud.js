const socket = io();
const hudId = new URLSearchParams(window.location.search).get("id");

let lastHP = null;

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {

  /* ===== NOME E NÍVEL (COM FALLBACK) ===== */
  const nome = state.name ?? "Sem Nome";
  const nivel = Number.isFinite(state.level) ? state.level : 1;

  hudName.textContent = nome;
  hudLevel.textContent = `Nv ${nivel}`;

  /* ===== VIDA ===== */
  const vidaAtual = Number(state.vidaAtual) || 0;
  const vidaMax = Number(state.vidaMax) || 1;

  vidaText.textContent = `${vidaAtual}/${vidaMax}`;

  const percent = Math.max(0, Math.min(100, (vidaAtual / vidaMax) * 100));
  vidaFill.style.width = `${percent}%`;

  /* ===== MANA ===== */
  const manaAtual = Number(state.manaAtual) || 0;
  const manaMax = Number(state.manaMax) || 0;

  manaText.textContent = `${manaAtual}/${manaMax}`;

  /* ===== ANIMAÇÕES ===== */
  if (lastHP !== null) {
    if (vidaAtual < lastHP) {
      hud.classList.add("hud-damage");
    } else if (vidaAtual > lastHP) {
      hud.classList.add("hud-heal");
    }

    setTimeout(() => {
      hud.classList.remove("hud-damage", "hud-heal");
    }, 600);
  }

  lastHP = vidaAtual;
});
