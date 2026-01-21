// hud.js
import { state } from "./shared-socket.js";

const vidaBar = document.getElementById("vidaBar");
const vidaText = document.getElementById("vidaText");
const manaText = document.getElementById("manaText");
const dadoBox = document.getElementById("dadoResultado");

function render(s) {
  const vidaPerc = (s.vida.atual / s.vida.max) * 100;

  vidaBar.style.width = `${vidaPerc}%`;
  vidaText.textContent = `${s.vida.atual}/${s.vida.max}`;
  manaText.textContent = `${s.mana.atual}/${s.mana.max}`;

  if (s.dado) {
    dadoBox.innerHTML = s.dado.resultados
      .map(r => `<div class="hex">${r}</div>`)
      .join("");

    dadoBox.classList.add("show");
    setTimeout(() => dadoBox.classList.remove("show"), 15000);
  }
}

render(state);

window.addEventListener("state:changed", (e) => {
  render(e.detail);
});
