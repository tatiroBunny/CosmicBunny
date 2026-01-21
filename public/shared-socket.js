// shared-socket.js
const socket = io();

const DEFAULT_STATE = {
  nome: "Leafone",
  nivel: 6,
  vida: { atual: 36, max: 100 },
  mana: { atual: 15, max: 15 },
  dado: null
};

let state = JSON.parse(localStorage.getItem("HUD_STATE")) || DEFAULT_STATE;

function saveState() {
  localStorage.setItem("HUD_STATE", JSON.stringify(state));
}

function updateState(patch) {
  state = { ...state, ...patch };
  saveState();
  socket.emit("state:update", state);
}

socket.on("state:sync", (newState) => {
  state = newState;
  saveState();
  window.dispatchEvent(new CustomEvent("state:changed", { detail: state }));
});

socket.emit("state:sync");

export { state, updateState };
