// ================================
// MODO MESTRE – P2P ISOLADO
// ================================

const socket = io();

// ID único desse mestre (por aba)
const MESTRE_ID = crypto.randomUUID();

let fichasAtivas = [];   // ids
let cacheFichas = {};   // id -> dados completos

// ---------- Utils ----------

function normalizarId(valor) {
  if (!valor) return null;
  valor = valor.trim();

  while (valor.startsWith("FICHA_FICHA_")) {
    valor = valor.replace("FICHA_FICHA_", "FICHA_");
  }

  if (/^\d+$/.test(valor)) return "FICHA_" + valor;
  if (valor.startsWith("FICHA_")) return valor;

  return null;
}

// ---------- Core ----------

function adicionarFicha() {
  const input = document.getElementById("fichaIdInput");
  const id = normalizarId(input.value);

  if (!id) {
    alert("ID de ficha inválido.");
    return;
  }

  if (fichasAtivas.includes(id)) {
    alert("Essa ficha já está adicionada.");
    return;
  }

  fichasAtivas.push(id);
  salvarEstado();

  socket.emit("requestFicha", {
    fichaId: id,
    mestreId: MESTRE_ID
  });

  input.value = "";
}

function removerFicha(id) {
  fichasAtivas = fichasAtivas.filter(f => f !== id);
  delete cacheFichas[id];
  salvarEstado();
  renderizar();
}

// ---------- Socket ----------

socket.on("receiveFicha", payload => {
  if (!payload || payload.mestreId !== MESTRE_ID) return;

  const { id, data } = payload;
  if (!id || !data) return;

  cacheFichas[id] = data;
  renderizar();
});

// ---------- Render ----------

function renderizar() {
  const container = document.getElementById("cardsContainer");
  const filtro = document.getElementById("filtroInput").value.toLowerCase();

  container.innerHTML = "";

  fichasAtivas.forEach(id => {
    const ficha = cacheFichas[id];
    if (!ficha) return;

    if (
      filtro &&
      !(
        ficha.nome?.toLowerCase().includes(filtro) ||
        id.toLowerCase().includes(filtro)
      )
    ) return;

    const card = document.createElement("div");
    card.className = "ficha-card";

    card.innerHTML = `
      <button class="fechar" onclick="removerFicha('${id}')">×</button>
      <h2>${ficha.nome || "Sem Nome"} <span>(${id})</span></h2>
      <p>${ficha.classe || "-"}</p>
    `;

    container.appendChild(card);
  });
}

// ---------- Persistência ----------

function salvarEstado() {
  localStorage.setItem(
    "MESTRE_FICHAS_ATIVAS",
    JSON.stringify(fichasAtivas)
  );
}

function carregarEstado() {
  const salvo = localStorage.getItem("MESTRE_FICHAS_ATIVAS");
  if (!salvo) return;

  fichasAtivas = JSON.parse(salvo);

  // pede novamente TODAS
  fichasAtivas.forEach(id => {
    socket.emit("requestFicha", {
      fichaId: id,
      mestreId: MESTRE_ID
    });
  });
}

// ---------- Init ----------

window.onload = () => {
  carregarEstado();
};
