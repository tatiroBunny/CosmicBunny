// ================================
// MODO MESTRE – CORE ESTÁVEL
// ================================

let fichasAtivas = [];

// ---------- Utils ----------

function normalizarId(valor) {
  if (!valor) return null;

  valor = valor.trim();

  // Remove duplicações tipo FICHA_FICHA_
  while (valor.startsWith("FICHA_FICHA_")) {
    valor = valor.replace("FICHA_FICHA_", "FICHA_");
  }

  // Se já estiver no formato correto
  if (valor.startsWith("FICHA_")) {
    return valor;
  }

  // Se for só número
  if (/^\d+$/.test(valor)) {
    return "FICHA_" + valor;
  }

  return null;
}

function buscarFicha(chave) {
  return (
    localStorage.getItem(chave) ||
    localStorage.getItem(chave.toLowerCase()) ||
    null
  );
}

// ---------- Core ----------

function adicionarFicha() {
  const input = document.getElementById("fichaIdInput");
  const valor = input.value;
  const chave = normalizarId(valor);

  if (!chave) {
    alert("ID de ficha inválido.");
    return;
  }

  if (fichasAtivas.includes(chave)) {
    alert("Essa ficha já está adicionada.");
    return;
  }

  const dados = buscarFicha(chave);

  if (!dados) {
    alert("Ficha não encontrada.");
    return;
  }

  fichasAtivas.push(chave);
  salvarEstado();
  renderizar();
  input.value = "";
}

function removerFicha(chave) {
  fichasAtivas = fichasAtivas.filter(id => id !== chave);
  salvarEstado();
  renderizar();
}

// ---------- Render ----------

function renderizar() {
  const container = document.getElementById("cardsContainer");
  const filtro = document.getElementById("filtroInput").value.toLowerCase();

  container.innerHTML = "";

  fichasAtivas.forEach(chave => {
    const dadosBrutos = buscarFicha(chave);
    if (!dadosBrutos) return;

    const ficha = JSON.parse(dadosBrutos);

    if (
      filtro &&
      !(
        ficha.nome?.toLowerCase().includes(filtro) ||
        chave.toLowerCase().includes(filtro)
      )
    ) {
      return;
    }

    const card = document.createElement("div");
    card.className = "ficha-card";

    card.innerHTML = `
      <button class="fechar" onclick="removerFicha('${chave}')">×</button>

      <h2>${ficha.nome || "Sem Nome"} <span>(${chave})</span></h2>
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
          ficha.pericias && ficha.pericias.length
            ? ficha.pericias.map(p => p.nome).join(" | ")
            : "-"
        }
      </div>

      <div class="secao">
        <strong>Anotações</strong><br>
        ${ficha.anotacoes || "-"}
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
  localStorage.setItem("MESTRE_FICHAS_ATIVAS", JSON.stringify(fichasAtivas));
}

function carregarEstado() {
  const salvo = localStorage.getItem("MESTRE_FICHAS_ATIVAS");
  if (salvo) {
    fichasAtivas = JSON.parse(salvo);
  }
}

// ---------- Navegação ----------

function voltar() {
  window.location.href = "controller.html";
}

// ---------- Init ----------

window.onload = () => {
  carregarEstado();
  renderizar();
};
