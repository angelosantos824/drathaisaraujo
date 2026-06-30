// Gerenciamento de fluxo de caixa para entradas, saídas e registros vinculados.
const caixaForm = document.getElementById("caixa-form");
const caixaIdInput = document.getElementById("caixa-id");
const caixaTbody = document.getElementById("caixa-tbody");
const filtroCaixaMes = document.getElementById("filtro-caixa-mes");
const filtroCaixaAno = document.getElementById("filtro-caixa-ano");
const pacienteCaixa = document.getElementById("paciente-caixa");
const agendamentoCaixa = document.getElementById("agendamento-caixa");
const categoriaCaixa = document.getElementById("categoria-caixa");
const limparCaixa = document.getElementById("limpar-caixa");

async function carregarPacientesCaixa() {
  const { data, error } = await supabase.from("pacientes").select("id, nome").order("nome");
  handleError(error);

  if (!pacienteCaixa || !data) return;
  pacienteCaixa.innerHTML = "<option value=\"\">Selecione um paciente</option>";
  data.forEach((paciente) => {
    pacienteCaixa.innerHTML += `<option value="${paciente.id}">${paciente.nome}</option>`;
  });
}

async function carregarAgendamentosCaixa(pacienteId = "") {
  let query = supabase.from("agendamentos").select("id, data_agendamento, hora_agendamento, paciente_id, paciente:paciente_id(nome)").order("data_agendamento", { ascending: true });
  if (pacienteId) {
    query = query.eq("paciente_id", pacienteId);
  }

  const { data, error } = await query;
  handleError(error);

  if (!agendamentoCaixa || !data) return;
  agendamentoCaixa.innerHTML = "<option value=\"\">Selecione um agendamento</option>";
  data.forEach((item) => {
    const label = `${item.data_agendamento} ${item.hora_agendamento} - ${item.paciente?.nome || "Paciente"}`;
    agendamentoCaixa.innerHTML += `<option value="${item.id}">${label}</option>`;
  });
}

async function carregarCategoriasCaixa() {
  const { data, error } = await supabase.from("categorias_financeiras").select("id, nome").order("nome");
  handleError(error);

  if (!categoriaCaixa) return;
  categoriaCaixa.innerHTML = "<option value=\"\">Selecione uma categoria</option>";
  data?.forEach((categoria) => {
    categoriaCaixa.innerHTML += `<option value="${categoria.id}">${categoria.nome}</option>`;
  });
}

async function carregarFluxoCaixa() {
  const mes = filtroCaixaMes?.value;
  const ano = filtroCaixaAno?.value;
  let query = supabase
    .from("fluxo_caixa")
    .select("*, paciente:paciente_id (nome), agendamento:agendamento_id (data_agendamento, hora_agendamento), categoria:categoria_id (nome)")
    .order("data", { ascending: false });

  if (mes && ano) {
    const mesStr = String(mes).padStart(2, "0");
    query = query.gte("data", `${ano}-${mesStr}-01`).lte("data", `${ano}-${mesStr}-31`);
  }

  const { data, error } = await query;
  handleError(error);

  caixaTbody.innerHTML = "";
  data?.forEach((registro) => {
    const row = document.createElement("tr");
    const agendamentoLabel = registro.agendamento ? `${registro.agendamento.data_agendamento} ${registro.agendamento.hora_agendamento}` : "-";
    row.innerHTML = `
      <td>${registro.data}</td>
      <td>${registro.tipo}</td>
      <td>${registro.paciente?.nome || "-"}</td>
      <td>${agendamentoLabel}</td>
      <td>${registro.categoria?.nome || "-"}</td>
      <td>${formatMoney(registro.valor)}</td>
      <td>${registro.forma_pagamento}</td>
      <td>
        <button class="button button-outline" data-id="${registro.id}" data-action="edit">Editar</button>
        <button class="button button-outline" data-id="${registro.id}" data-action="delete">Excluir</button>
      </td>
    `;
    caixaTbody.appendChild(row);
  });
}

function limparFormularioCaixa() {
  caixaForm.reset();
  caixaIdInput.value = "";
}

async function salvarFluxoCaixa(event) {
  event.preventDefault();

  const id = caixaIdInput.value;
  const movimento = {
    tipo: document.getElementById("tipo").value,
    data: document.getElementById("data").value,
    valor: Number(document.getElementById("valor").value) || 0,
    forma_pagamento: document.getElementById("forma_pagamento").value,
    paciente_id: document.getElementById("paciente-caixa").value || null,
    agendamento_id: document.getElementById("agendamento-caixa").value || null,
    categoria_id: document.getElementById("categoria-caixa").value || null,
    descricao: document.getElementById("descricao").value.trim() || null,
  };

  if (!movimento.data || movimento.valor <= 0) {
    alert("Preencha a data e um valor válido para o movimento.");
    return;
  }

  let response;
  if (id) {
    response = await supabase.from("fluxo_caixa").update(movimento).eq("id", id);
  } else {
    response = await supabase.from("fluxo_caixa").insert(movimento);
  }

  handleError(response.error);
  if (!response.error) {
    limparFormularioCaixa();
    carregarFluxoCaixa();
  }
}

async function editarFluxoCaixa(id) {
  const { data, error } = await supabase.from("fluxo_caixa").select("*").eq("id", id).single();
  handleError(error);

  if (!data) return;

  caixaIdInput.value = data.id;
  document.getElementById("tipo").value = data.tipo;
  document.getElementById("data").value = data.data;
  document.getElementById("valor").value = data.valor;
  document.getElementById("forma_pagamento").value = data.forma_pagamento;
  document.getElementById("paciente-caixa").value = data.paciente_id || "";
  document.getElementById("agendamento-caixa").value = data.agendamento_id || "";
  document.getElementById("categoria-caixa").value = data.categoria_id || "";
  document.getElementById("descricao").value = data.descricao || "";
}

async function deletarFluxoCaixa(id) {
  if (!confirm("Deseja realmente excluir este lançamento do caixa?")) {
    return;
  }

  const { error } = await supabase.from("fluxo_caixa").delete().eq("id", id);
  handleError(error);
  if (!error) {
    carregarFluxoCaixa();
  }
}

caixaTbody?.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    editarFluxoCaixa(id);
  }

  if (action === "delete") {
    deletarFluxoCaixa(id);
  }
});

pacienteCaixa?.addEventListener("change", () => {
  carregarAgendamentosCaixa(pacienteCaixa.value);
});

limparCaixa?.addEventListener("click", limparFormularioCaixa);
caixaForm?.addEventListener("submit", salvarFluxoCaixa);

if (caixaTbody) {
  Promise.all([carregarPacientesCaixa(), carregarAgendamentosCaixa(), carregarCategoriasCaixa()]).then(() => carregarFluxoCaixa());
}

filtroCaixaMes?.addEventListener("change", carregarFluxoCaixa);
filtroCaixaAno?.addEventListener("change", carregarFluxoCaixa);
