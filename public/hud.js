const socket = io();

const params = new URLSearchParams(window.location.search);
const hudId = params.get("id");

socket.emit("joinHUD", hudId);

const hud = document.getElementById("hud");
const hudName = document.getElementById("hudName");
const hudLevel = document.getElementById("hudLevel");
const vidaFill = document.querySelector(".vida-fill");
const vidaText = document.querySelector(".vida-text");
const manaText = document.querySelector(".mana-text");

let ultimaVida = null;

function atualizarVida(atual, max) {
  if (!max || max <= 0) return;

  const pct = Math.max(0, Math.min(1, atual / max));
  vidaFill.style.width = `${pct * 100}%`;
  vidaText.textContent = `${atual} / ${max}`;
}

socket.on("stateSync", state => {
  if (!state) return;

  hudName.textContent = state.name || "SEM NOME";
  hudLevel.textContent = state.level || 1;

  manaText.textContent = `${state.manaAtual ?? 0} / ${state.manaMax ?? 0}`;

  if (ultimaVida !== null) {
    if (state.vidaAtual < ultimaVida) {
      hud.classList.add("hud-damage");
    } else if (state.vidaAtual > ultimaVida) {
      hud.classList.add("hud-heal");
    }

    setTimeout(() => {
      hud.classList.remove("hud-damage", "hud-heal");
    }, 300);
  }

  ultimaVida = state.vidaAtual;
  atualizarVida(state.vidaAtual, state.vidaMax);
});
