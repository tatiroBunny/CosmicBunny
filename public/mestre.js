// ================================
// MODO MESTRE – SERVER BASED
// ================================

const socket = io();

let fichasAtivas = [];          // ids
let cacheFichas = {};           // id -> dados da ficha

// ---------- Utils ----------

function normalizarId(valor) {
  if (!valor) return null;

  valor = valor.trim();

  while (valor.startsWith("FICHA_FICHA_")) {
    valor = valor.replace("FICHA_FICHA_", "FICHA_");
  }

  if (valor.startsWith("FICHA_")) return valor;

  if (/^\d+$/.test(valor)) return "FICHA_" + valor;

  return null;
}

// ---------- Core ----------

function adicionarFicha() {
  const input = document.getElementById("fichaIdInput");
  const chave = normalizarId(input.value);

  if (!chave) {
    alert("ID de ficha inválido.");
    return;
  }

  if (fichasAtivas.includes(chave)) {
    alert("Essa ficha já está adicionada.");
    return;
  }

  // pede ao servidor
  socket.emit("loadFicha", chave);

  input.value = "";
}

function removerFicha(chave) {
  fichasAtivas = fichasAtivas.filter(id => id !== chave);
  delete cacheFichas[chave];
  salvarEstado();
  renderizar();
}

// ---------- Socket ----------

socket.on("fichaData", ficha => {
  if (!ficha || !ficha.id) {
    alert("Ficha não encontrada no servidor.");
    return;
  }

  const id = ficha.id;

  cacheFichas[id] = ficha;

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
    ) {
      return;
    }

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
          ficha.skills && ficha.skills.length
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

// ---------- Persistência (APENAS IDs) ----------

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

  // recarrega todas do servidor
  fichasAtivas.forEach(id => socket.emit("loadFicha", id));
}

// ---------- Navegação ----------

function voltar() {
  window.location.href = "controller.html";
}

// ---------- Init ----------

window.onload = () => {
  carregarEstado();
};
