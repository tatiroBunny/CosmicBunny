/* ===============================
   ESTADO GLOBAL ÚNICO
================================ */
const SAVE_KEY = "COSMIC_STATE_V1";

/* Estado padrão */
const defaultState = {
  name: "Leafone",
  level: 6,

  vidaAtual: 36,
  vidaMax: 100,

  manaAtual: 15,
  manaMax: 15,

  showVidaBar: true,

  avatar: "avatar.png",

  dice: {
    sides: 20,
    quantity: 1,
    rolls: []
  }
};

/* Carrega estado salvo */
let state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    return saved ? { ...defaultState, ...saved } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
})();

/* Canal de comunicação */
const channel = new BroadcastChannel("cosmic_channel");

/* Envia estado */
function send() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  channel.postMessage(state);
}

/* Envio inicial */
send();
/* =========================
   HUD – ANIMAÇÕES
========================= */

function animateHP(oldHP, newHP) {
  const hud = document.querySelector(".hud");
  if (!hud) return;

  hud.classList.remove("hud-damage", "hud-heal");

  if (newHP < oldHP) {
    hud.classList.add("hud-damage");
  } else if (newHP > oldHP) {
    hud.classList.add("hud-heal");
  }

  setTimeout(() => {
    hud.classList.remove("hud-damage", "hud-heal");
  }, 700);
}

/* TOGGLE BARRA */
function toggleHPBar() {
  const hud = document.querySelector(".hud");
  hud.classList.toggle("hp-hidden");
}

/* DADOS */
function renderDiceResults(results, faces) {
  const area = document.getElementById("diceResults");
  if (!area) return;

  area.innerHTML = "";
  area.className = "dice-area";

  results.forEach(v => {
    const el = document.createElement("div");
    el.className = "dice-hex";

    if (faces === 20 && v === 20) el.classList.add("dice-crit");
    if (faces === 20 && v === 1) el.classList.add("dice-fail");

    el.textContent = v;
    area.appendChild(el);
  });
}
function mostrarResultadoDado(valor, tipo = "normal") {
    const diceEl = document.getElementById("diceResult");
    if (!diceEl) return;

    // Limpa timeout anterior
    if (diceHideTimeout) {
        clearTimeout(diceHideTimeout);
        diceHideTimeout = null;
    }

    // Texto
    diceEl.textContent = valor;

    // Reset classes
    diceEl.className = "dice-result";

    // Tipo de resultado
    if (tipo === "critico") {
        diceEl.classList.add("critico");
    } else if (tipo === "falha") {
        diceEl.classList.add("falha");
    } else {
        diceEl.classList.add("normal");
    }

    // Força reflow (pra animação sempre rodar)
    diceEl.offsetHeight;

    // Entrada
    diceEl.classList.add("show");

    // Esconder após 15s
    diceHideTimeout = setTimeout(() => {
        esconderResultadoDado();
    }, 15000);
}
function esconderResultadoDado() {
    const diceEl = document.getElementById("diceResult");
    if (!diceEl) return;

    diceEl.classList.remove("show");
    diceEl.classList.add("hide");

    setTimeout(() => {
        diceEl.textContent = "";
        diceEl.className = "dice-result";
    }, 600); // tempo da animação
}
