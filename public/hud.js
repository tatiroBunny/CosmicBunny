const socket = io();
const hudId = new URLSearchParams(window.location.search).get("id");

let lastHP = null;
let damageTimeout = null;

socket.emit("joinHUD", hudId);

socket.on("stateSync", state => {

  /* ===== IDENTIDADE ===== */
  hudName.textContent = state.name ?? "Sem Nome";
  hudLevel.textContent = Number.isFinite(state.level) ? state.level : 1;

  if (state.avatar) avatarImg.src = state.avatar;

  /* ===== TEMA ===== */
  document.body.dataset.theme = state.theme || "dark";

  /* ===== VIDA ===== */
  const vidaAtual = Number(state.vidaAtual) || 0;
  const vidaMax = Number(state.vidaMax) || 1;

  vidaText.textContent = `${vidaAtual}/${vidaMax}`;

  const percent = Math.max(0, Math.min(100, (vidaAtual / vidaMax) * 100));

  /* Barra principal (rápida) */
  vidaFill.style.width = `${percent}%`;

  /* Barra de dano retardado */
  if (lastHP !== null && vidaAtual < lastHP) {
    clearTimeout(damageTimeout);

    damageTimeout = setTimeout(() => {
      vidaDamage.style.width = `${percent}%`;
    }, 350);
  } else {
    vidaDamage.style.width = `${percent}%`;
  }

  lastHP = vidaAtual;

  /* ===== MANA ===== */
  const manaAtual = Number(state.manaAtual) || 0;
  const manaMax = Number(state.manaMax) || 0;
  manaText.textContent = `${manaAtual}/${manaMax}`;
});
