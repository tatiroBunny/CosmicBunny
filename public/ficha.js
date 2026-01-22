/* ===============================
   SOCKET
=============================== */

const socket = io();

/* ===============================
   ESTADO GLOBAL
=============================== */

let currentFichaId = null;

/* ===============================
   HELPERS
=============================== */

function gerarIdFicha() {
  return "FICHA_" + Date.now();
}

function getFichaData() {
  const skills = Array.from(document.querySelectorAll(".skill")).map(skill => ({
    checked: skill.querySelector("input[type=checkbox]").checked,
    name: skill.querySelector(".skill-name").value,
    attr: skill.querySelector(".skill-attr").value
  }));

  return {
    id: currentFichaId,
    nome: charName.value,
    classe: charClass.value,
    atributos: {
      for: forInput.value,
      des: desInput.value,
      con: conInput.value,
      int: intInput.value,
      sab: sabInput.value,
      car: carInput.value
    },
    ca: caInput.value,
    vidaMax: vidaMaxInput.value,
    manaMax: manaMaxInput.value,
    dadoVida: dadoVidaInput.value,
    skills,
    notas: notasInput.value,
    inventario: inventarioInput.value
  };
}

function setFichaData(data) {
  currentFichaId = data.id;
  fichaIdDisplay.value = currentFichaId;

  charName.value = data.nome || "";
  charClass.value = data.classe || "";

  forInput.value = data.atributos?.for ?? 10;
  desInput.value = data.atributos?.des ?? 10;
  conInput.value = data.atributos?.con ?? 10;
  intInput.value = data.atributos?.int ?? 10;
  sabInput.value = data.atributos?.sab ?? 10;
  carInput.value = data.atributos?.car ?? 10;

  caInput.value = data.ca ?? 10;
  vidaMaxInput.value = data.vidaMax ?? "";
  manaMaxInput.value = data.manaMax ?? "";
  dadoVidaInput.value = data.dadoVida ?? "d8";

  const skillEls = document.querySelectorAll(".skill");
  skillEls.forEach((skill, i) => {
    if (!data.skills?.[i]) return;
    skill.querySelector("input[type=checkbox]").checked = data.skills[i].checked;
    skill.querySelector(".skill-name").value = data.skills[i].name;
    skill.querySelector(".skill-attr").value = data.skills[i].attr;
  });

  notasInput.value = data.notas || "";
  inventarioInput.value = data.inventario || "";
}

/* ===============================
   CRUD (SERVIDOR)
=============================== */

function novaFicha() {
  currentFichaId = gerarIdFicha();
  fichaIdDisplay.value = currentFichaId;

  setFichaData({
    id: currentFichaId,
    nome: "",
    classe: "",
    atributos: {},
    skills: Array(10).fill({ checked: false, name: "", attr: "FOR" })
  });
}

function salvarFicha() {
  if (!currentFichaId) {
    alert("Crie uma ficha primeiro.");
    return;
  }

  const data = getFichaData();

  socket.emit("saveFicha", {
    id: currentFichaId,
    data
  });
}

socket.on("fichaSaved", id => {
  atualizarSelect();
  alert("Ficha salva no servidor!");
});

function excluirFicha() {
  alert("Exclusão ainda não implementada no servidor.");
}

/* ===============================
   SELECT (SERVIDOR)
=============================== */

function atualizarSelect() {
  socket.emit("listFichas");
}

socket.on("fichasList", fichas => {
  fichaSelect.innerHTML = `<option value="">— Selecionar Ficha —</option>`;

  fichas.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = f.nome ? `${f.nome} (${f.id})` : f.id;
    if (f.id === currentFichaId) opt.selected = true;
    fichaSelect.appendChild(opt);
  });
});

fichaSelect.onchange = () => {
  if (!fichaSelect.value) return;
  socket.emit("loadFicha", fichaSelect.value);
};

socket.on("fichaData", data => {
  if (!data) {
    alert("Ficha não encontrada no servidor.");
    return;
  }
  setFichaData(data);
});

/* ===============================
   BOTÕES
=============================== */

newFichaBtn.onclick = novaFicha;
saveFichaBtn.onclick = salvarFicha;
deleteFichaBtn.onclick = excluirFicha;

/* ===============================
   UTIL
=============================== */

function copiarFichaId() {
  if (!currentFichaId) return;
  navigator.clipboard.writeText(currentFichaId);
}

/* ===============================
   INIT
=============================== */

window.onload = atualizarSelect;
