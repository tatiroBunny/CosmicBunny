const session = JSON.parse(localStorage.getItem("COSMIC_SESSION"));

if (!session) {
  window.location.href = "login.html";
}

const socket = io();
const hudId = session.hudId;

socket.emit("joinHUD", hudId);

document.getElementById("applyBtn").onclick = () => {
  const state = {
    name: charName.value || "Sem Nome",
    level: Number(charLevel.value) || 1,

    vidaAtual: Number(vidaAtual.value),
    vidaMax: Number(vidaMax.value),

    manaAtual: Number(manaAtual.value),
    manaMax: Number(manaMax.value)
  avatar: "https://SEU_LINK_DA_IMAGEM.png"

  };

  socket.emit("updateState", { hudId, state });
};

document.getElementById("openHudBtn").onclick = () => {
  window.open(`hud.html?id=${hudId}`, "_blank");
};

