const socket = io();

const params = new URLSearchParams(window.location.search);
const hudId = params.get("id");

socket.emit("joinHUD", hudId);

const hud = document.getElementById("hud");
const hudName = document.getElementById("hudName");
const hudLevel = document.getElementById("hudLevel");
const vidaFill = document.getElementById("vidaFill");
const vidaText = document.getElementById("vidaText");
const manaText = document.getElementById("manaText");

let ultimaVida = null;

function atualizarVida(atual, max) {
  if (!max || max <= 0) {
    vidaFill.style.width = "0%";
    vidaText.textContent = "0 / 0";
    return;
  }

  const pct = Math.max(0, Math.min(1, atual / max));
  vidaFill.style.width = `${pct * 100}%`;
  vidaText.textContent = `${atual} / ${max}`;
}

socket.on("stateSync", state => {
  if (!state) return;

  hudName.textContent = state.name || "Sem Nome";
  hudLevel.textContent = state.level || 1;

  manaText.textContent = `${state.manaAtual ?? 0} / ${state.manaMax ?? 0}`;

  document.body.dataset.theme = state.theme || "dark";

  if (ultimaVida !== null) {
    if (state.vidaAtual < ultimaVida) {
      hud.classList.add("dano");
    } else if (state.vidaAtual > ultimaVida) {
      hud.classList.add("cura");
    }

    setTimeout(() => {
      hud.classList.remove("dano", "cura");
    }, 300);
  }

  ultimaVida = state.vidaAtual;
  atualizarVida(state.vidaAtual, state.vidaMax);
});
