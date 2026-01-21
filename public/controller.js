// controller.js
import { state, updateState } from "./shared-socket.js";

window.applyStatus = () => {
  updateState({
    vida: {
      atual: Number(document.getElementById("vidaAtual").value),
      max: Number(document.getElementById("vidaMax").value)
    },
    mana: {
      atual: Number(document.getElementById("manaAtual").value),
      max: Number(document.getElementById("manaMax").value)
    }
  });
};

window.rolarDado = () => {
  const faces = Number(document.getElementById("dadoTipo").value.replace("d",""));
  const qtd = Number(document.getElementById("dadoQtd").value);

  const resultados = Array.from({ length: qtd }, () =>
    Math.floor(Math.random() * faces) + 1
  );

  updateState({
    dado: {
      faces,
      resultados,
      timestamp: Date.now()
    }
  });
};

window.abrirHUD = () => {
  window.open("/hud.html", "HUD", "width=500,height=300");
};
