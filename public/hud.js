const socket = io();

const params = new URLSearchParams(window.location.search);
const hudId = params.get("id");

socket.emit("joinHUD", hudId);

const hud = document.getElementById("hud");
const hudName = document.getElementById("hudName");
const hudLevel = document.getElementById("hudLevel");
const vidaText = document.getElementById("vidaText");
const manaText = document.getElementById("manaText");

const vidaLeft = document.querySelector(".vida-half.left");
const vidaRight = document.querySelector(".vida-half.right");

let ultimaVida = null;

function atualizarVida(atual, max) {
  if (!max || max <= 0) {
    vidaText.textContent = "0 / 0";
    vidaLeft.style.width = "0%";
    vidaRight.style.width = "0%";
    return;
  }

  const pct = Math.max(0, Math.min(1, atual / max));

  // cada lado ocupa METADE da porcentagem
  const halfPct = pct * 50;

  vidaLeft.style.width = `${halfPct}%`;
  vidaRight.style.width = `${halfPct}%`;

  vidaText.textContent = `${atual} / ${max}`;
}

socket.on("stateSync", state => {
  if (!state) return;

  hudName.textContent = state.name || "Sem Nome";
  hudLevel.textContent = state.level || 1;

  manaText.textContent = `Mana: ${state.manaAtual ?? 0} / ${state.manaMax ?? 0}`;

  // ícone
  if (state.icon) {
    document.documentElement.style.setProperty(
      "--avatar-url",
      `url("${state.icon}")`
    );
  }

  // dano / cura
  if (ultimaVida !== null) {
    if (state.vidaAtual < ultimaVida) {
      hud.classList.add("hud-damage");
    } else if (state.vidaAtual > ultimaVida) {
      hud.classList.add("hud-heal");
    }

    setTimeout(() => {
      hud.classList.remove("hud-damage", "hud-heal");
    }, 250);
  }

  ultimaVida = state.vidaAtual;

  atualizarVida(state.vidaAtual, state.vidaMax);
});
