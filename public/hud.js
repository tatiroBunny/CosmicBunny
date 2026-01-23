const socket = io();

const params = new URLSearchParams(window.location.search);
const hudId = params.get("id");

socket.emit("joinHUD", hudId);

/* ===== ELEMENTOS ===== */
const hud = document.getElementById("hud");
const hudName = document.getElementById("hudName");
const hudLevel = document.getElementById("hudLevel");
const vidaText = document.getElementById("vidaText");
const manaText = document.getElementById("manaText");

const vidaLeft = document.querySelector(".vida-left");
const vidaRight = document.querySelector(".vida-right");

let ultimaVida = null;

/* ===== VIDA FECHANDO PARA O CENTRO ===== */
function atualizarVida(atual, max) {
  if (!max || max <= 0) return;

  const pct = Math.max(0, Math.min(1, atual / max));

  // fecha da esquerda e da direita para o centro
  vidaLeft.style.transform = `scaleX(${pct})`;
  vidaRight.style.transform = `scaleX(${pct})`;

  vidaText.textContent = `${atual} / ${max}`;
}

/* ===== SOCKET ===== */
socket.on("stateSync", state => {
  if (!state) return;

  /* ===== TEXTO ===== */
  hudName.textContent = state.name || "Sem Nome";
  hudLevel.textContent = state.level || 1;

  manaText.textContent = `${state.manaAtual} / ${state.manaMax}`;

  /* ===== TEMA ===== */
  document.body.dataset.theme = state.theme || "dark";

  /* ===== ÍCONE DO HUD ===== */
  if (state.iconUrl) {
    document.documentElement.style.setProperty(
      "--avatar-url",
      `url("${state.iconUrl}")`
    );
  }

  /* ===== ANIMAÇÃO DE DANO / CURA ===== */
  if (ultimaVida !== null) {
    if (state.vidaAtual < ultimaVida) {
      hud.classList.add("hud-damage");
    } else if (state.vidaAtual > ultimaVida) {
      hud.classList.add("hud-heal");
    }

    setTimeout(() => {
      hud.classList.remove("hud-damage", "hud-heal");
    }, 400);
  }

  ultimaVida = state.vidaAtual;

  /* ===== ATUALIZA VIDA ===== */
  atualizarVida(state.vidaAtual, state.vidaMax);
});
