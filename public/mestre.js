// ================================
// MODO MESTRE – P2P ISOLADO E ESTÁVEL
// ================================

const socket = io();

// ID ÚNICO DO MESTRE (ISOLA ESTADO ENTRE MESTRES)
const MESTRE_ID = "MESTRE_" + crypto.randomUUID();

// ids ativos
let fichasAtivas = [];

// cache local das fichas
let cacheFichas = {};

// ---------- Utils ----------

function normalizarId(valor) {
  if (!valor) return null;

  valor = String(valor).trim();

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

  // já existe no estado
  if (fichasAtivas.includes(id)) {

    // mas não está no cache → REPEDIR
    if (!cacheFichas[id]) {
      socket.emit("requestFicha", {
        fichaId: id,
        mestreId: MESTRE_ID
      });
      alert("Ficha estava no estado. Requisitando novamente...");
      return;
    }

    alert("Essa ficha já está adicionada.");
    return;
  }

  // nova ficha
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

// recebe ficha do jogador
socket.on("receiveFicha", payload => {
  if (!payload || !payload.id || !payload.data) return;

  const { id, data, mestreId } = payload;

  // IGNORA fichas de outros mestres
  if (mestreId !== MESTRE_ID) return;

  cacheFichas[id] = data;

  if (!fichasAtivas.includes(id)) {
    fichasAtivas.push(id);
  }

  salvarEstado();
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

// ---------- Persistência (SÓ IDS, POR MESTRE) ----------

function salvarEstado() {
  localStorage.setItem(
    `MESTRE_FICHAS_ATIVAS_${MESTRE_ID}`,
    JSON.stringify(fichasAtivas)
  );
}

function carregarEstado() {
  const salvo = localStorage.getItem(
    `MESTRE_FICHAS_ATIVAS_${MESTRE_ID}`
  );

  if (!salvo) return;

  fichasAtivas = JSON.parse(salvo);

  // repede todas ao recarregar
  fichasAtivas.forEach(id => {
    socket.emit("requestFicha", {
      fichaId: id,
      mestreId: MESTRE_ID
    });
  });
}

// ---------- Navegação ----------

function voltar() {
  window.location.href = "controller.html";
}

// ---------- Init ----------

window.onload = () => {
  carregarEstado();
};
