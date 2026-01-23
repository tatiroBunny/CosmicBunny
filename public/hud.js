const socket = io();

const params = new URLSearchParams(window.location.search);
const hudId = params.get("id");

socket.emit("joinHUD", hudId);

const hud = document.getElementById("hud");
const hudName = document.getElementById("hudName");
const hudLevel = document.getElementById("hudLevel");
const vidaText = document.getElementById("vidaText");
const manaText = document.getElementById("manaText");

const vidaLeft = document.querySelector(".vida-left");
const vidaRight = document.querySelector(".vida-right");

let ultimaVida = null;

function atualizarVida(atual, max) {
  const pct = Math.max(0, Math.min(1, atual / max));
  vidaLeft.style.transform = `scaleX(${pct})`;
  vidaRight.style.transform = `scaleX(${pct})`;
  vidaText.textContent = `${atual} / ${max}`;
}

socket.on("stateSync", state => {
  if (!state) return;

  hudName.textContent = state.name || "Sem Nome";
  hudLevel.textContent = state.level || 1;

  manaText.textContent = `Mana: ${state.manaAtual} / ${state.manaMax}`;

  // tema
  document.body.dataset.theme = state.theme || "dark";

  // ícone
  if (state.icon) {
    document.documentElement.style.setProperty(
      "--avatar-url",
      `url("${state.icon}")`
    );
  }

  // animação dano / cura
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

  atualizarVida(state.vidaAtual, state.vidaMax);
});
