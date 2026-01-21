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

  forInput.value = data.atributos?.for || 10;
  desInput.value = data.atributos?.des || 10;
  conInput.value = data.atributos?.con || 10;
  intInput.value = data.atributos?.int || 10;
  sabInput.value = data.atributos?.sab || 10;
  carInput.value = data.atributos?.car || 10;

  caInput.value = data.ca || 10;
  vidaMaxInput.value = data.vidaMax || "";
  manaMaxInput.value = data.manaMax || "";
  dadoVidaInput.value = data.dadoVida || "d8";

  const skillEls = document.querySelectorAll(".skill");
  skillEls.forEach((skill, i) => {
    if (!data.skills[i]) return;
    skill.querySelector("input[type=checkbox]").checked = data.skills[i].checked;
    skill.querySelector(".skill-name").value = data.skills[i].name;
    skill.querySelector(".skill-attr").value = data.skills[i].attr;
  });

  notasInput.value = data.notas || "";
  inventarioInput.value = data.inventario || "";
}

/* ===============================
   CRUD
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

  atualizarSelect();
}

function salvarFicha() {
  if (!currentFichaId) {
    alert("Crie uma ficha primeiro.");
    return;
  }

  const data = getFichaData();
  localStorage.setItem(currentFichaId, JSON.stringify(data));
  atualizarSelect();
}

function excluirFicha() {
  if (!currentFichaId) return;
  if (!confirm("Excluir esta ficha?")) return;

  localStorage.removeItem(currentFichaId);
  currentFichaId = null;
  location.reload();
}

/* ===============================
   SELECT
   =============================== */

function atualizarSelect() {
  fichaSelect.innerHTML = `<option value="">— Selecionar Ficha —</option>`;

  Object.keys(localStorage)
    .filter(k => k.startsWith("FICHA_"))
    .forEach(id => {
      const data = JSON.parse(localStorage.getItem(id));
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = data.nome ? `${data.nome} (${id})` : id;
      if (id === currentFichaId) opt.selected = true;
      fichaSelect.appendChild(opt);
    });
}

fichaSelect.onchange = () => {
  if (!fichaSelect.value) return;
  const data = JSON.parse(localStorage.getItem(fichaSelect.value));
  setFichaData(data);
};

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
