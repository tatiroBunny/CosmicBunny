// ================================
// MODO MESTRE – P2P ISOLADO POR SALA
// ================================

const socket = io();

/* ================================
   IDENTIDADE DO MESTRE (LOCAL)
================================ */

// um mestre = um universo
const MESTRE_ID =
  localStorage.getItem("MESTRE_ID") ||
  (() => {
    const id = "MESTRE_" + crypto.randomUUID();
    localStorage.setItem("MESTRE_ID", id);
    return id;
  })();

// entra na sala exclusiva do mestre
socket.emit("joinMestre", MESTRE_ID);

/* ================================
   ESTADO
================================ */

let fichasAtivas = [];   // ids
let cacheFichas = {};   // id -> dados completos

/* ================================
   UTILS
================================ */

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

/* ================================
   CORE
================================ */

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

  // pede APENAS para jogadores, ligado a ESTE mestre
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

/* ================================
   SOCKET
================================ */

// recebe ficha SOMENTE deste mestre
socket.on("receiveFicha", payload => {
  if (!payload || !payload.id || !payload.data) return;

  const { id, data } = payload;

  cacheFichas[id] = data;

  if (!fichasAtivas.includes(id)) {
    fichasAtivas.push(id);
  }

  salvarEstado();
  renderizar();
});

/* ================================
   RENDER
================================ */

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

      <p>
        <strong>Vida Máx:</strong> ${ficha.vidaMax ?? "-"} |
        <strong>Mana Máx:</strong> ${ficha.manaMax ?? "-"} |
        <strong>CA:</strong> ${ficha.ca ?? "-"} |
        <strong>Dado:</strong> ${ficha.dadoVida ?? "-"}
      </p>

      <div class="secao">
        <strong>Atributos</strong><br>
        FOR: ${ficha.atributos?.for ?? "-"} |
        DES: ${ficha.atributos?.des ?? "-"} |
        CON: ${ficha.atributos?.con ?? "-"} |
        INT: ${ficha.atributos?.int ?? "-"} |
        SAB: ${ficha.atributos?.sab ?? "-"} |
        CAR: ${ficha.atributos?.car ?? "-"}
      </div>

      <div class="secao">
        <strong>Perícias</strong><br>
        ${
          ficha.skills?.length
            ? ficha.skills.map(p => p.name).join(" | ")
            : "-"
        }
      </div>

      <div class="secao">
        <strong>Anotações</strong><br>
        ${ficha.notas || "-"}
      </div>

      <div class="secao">
        <strong>Inventário</strong><br>
        ${ficha.inventario || "-"}
      </div>
    `;

    container.appendChild(card);
  });
}

/* ================================
   PERSISTÊNCIA (SÓ IDS, LOCAL)
================================ */

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

  // pede novamente as fichas AO VIVO
  fichasAtivas.forEach(id =>
    socket.emit("requestFicha", {
      fichaId: id,
      mestreId: MESTRE_ID
    })
  );
}

/* ================================
   NAVEGAÇÃO
================================ */

function voltar() {
  window.location.href = "controller.html";
}

/* ================================
   INIT
================================ */

window.onload = () => {
  carregarEstado();
};
