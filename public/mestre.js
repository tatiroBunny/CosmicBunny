// ================================
// MODO MESTRE – SERVER DIRECT (ISOLADO)
// ================================

const socket = io();

// estado do mestre (LOCAL)
let fichasAtivas = [];
let cacheFichas = {};

// chave fixa do modo mestre
const STORAGE_KEY = "MESTRE_FICHAS_ATIVAS";

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

  if (fichasAtivas.includes(id)) {
    alert("Essa ficha já está adicionada.");
    return;
  }

  fichasAtivas.push(id);
  salvarEstado();

  socket.emit("loadFicha", id);
  input.value = "";
}

function removerFicha(id) {
  fichasAtivas = fichasAtivas.filter(f => f !== id);
  delete cacheFichas[id];
  salvarEstado();
  renderizar();
}

// ---------- 🔥 RESET FORÇADO ----------

function limparCampanha() {
  if (!confirm("Isso vai APAGAR TODAS as fichas do modo mestre. Continuar?")) {
    return;
  }

  // limpa storage
  localStorage.removeItem(STORAGE_KEY);

  // limpa memória
  fichasAtivas.length = 0;
  cacheFichas = {};

  // limpa UI
  document.getElementById("cardsContainer").innerHTML = "";

  alert("Modo mestre resetado com sucesso.");
}

// ---------- Socket ----------

socket.on("fichaData", ficha => {
  // 🔒 se não há estado ativo, ignora qualquer resposta
  if (!fichasAtivas.length) return;

  if (!ficha || !ficha.id) {
    console.warn("Ficha ignorada (não existe no servidor).");
    return;
  }

  cacheFichas[ficha.id] = ficha;

  if (!fichasAtivas.includes(ficha.id)) {
    fichasAtivas.push(ficha.id);
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

// ---------- Persistência ----------

function salvarEstado() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fichasAtivas));
}

function carregarEstado() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (!salvo) return;

  fichasAtivas = JSON.parse(salvo);

  fichasAtivas.forEach(id => socket.emit("loadFicha", id));
}

// ---------- Navegação ----------

function voltar() {
  window.location.href = "controller.html";
}

// ---------- Init ----------

window.onload = carregarEstado;
