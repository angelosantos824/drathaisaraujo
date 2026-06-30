// Gerenciamento de agendamentos com seleção de paciente e status.
const pacienteSelect = document.getElementById("paciente-select");
const agendamentoForm = document.getElementById("agendamento-form");
const agendamentosTbody = document.getElementById("agendamentos-tbody");
const filtroData = document.getElementById("filtro-data");
const filtrarDia = document.getElementById("filtrar-dia");
const filtrarMes = document.getElementById("filtrar-mes");
const resetAgendamento = document.getElementById("reset-agendamento");

async function carregarPacientesSelect() {
  const { data, error } = await supabase.from("pacientes").select("id, nome").order("nome");
  handleError(error);

  if (data) {
    pacienteSelect.innerHTML = "<option value=\"\">Selecione um paciente</option>";
    data.forEach((paciente) => {
      pacienteSelect.innerHTML += `<option value="${paciente.id}">${paciente.nome}</option>`;
    });
  }
}

async function carregarAgendamentos(dataFiltro, tipoFiltro = "dia") {
  let query = supabase
    .from("agendamentos")
    .select("*, paciente:paciente_id (nome)")
    .order("data_agendamento", { ascending: true });

  if (dataFiltro) {
    if (tipoFiltro === "dia") {
      query = query.eq("data_agendamento", dataFiltro);
    } else {
      const anoMes = dataFiltro.slice(0, 7);
      query = query.gte("data_agendamento", `${anoMes}-01`).lte("data_agendamento", `${anoMes}-31`);
    }
  }

  const { data, error } = await query;
  handleError(error);

  agendamentosTbody.innerHTML = "";
  data?.forEach((agendamento) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${agendamento.paciente?.nome || "-"}</td>
      <td>${agendamento.data_agendamento}</td>
      <td>${agendamento.hora_agendamento}</td>
      <td>${agendamento.servico}</td>
      <td>${agendamento.status}</td>
      <td>
        <button class="button button-outline" data-id="${agendamento.id}" data-action="edit">Editar</button>
        <button class="button button-outline" data-id="${agendamento.id}" data-action="delete">Excluir</button>
      </td>
    `;
    agendamentosTbody.appendChild(row);
  });
}

async function preencherFormularioAgendamento(agendamento) {
  document.getElementById("agendamento-id").value = agendamento.id;
  document.getElementById("paciente-select").value = agendamento.paciente_id;
  document.getElementById("data-agendamento").value = agendamento.data_agendamento;
  document.getElementById("hora-agendamento").value = agendamento.hora_agendamento;
  document.getElementById("servico").value = agendamento.servico;
  document.getElementById("status").value = agendamento.status;
  document.getElementById("agendamento-observacoes").value = agendamento.observacoes || "";
}

async function salvarAgendamento(event) {
  event.preventDefault();

  const id = document.getElementById("agendamento-id").value;
  const agendamento = {
    paciente_id: Number(document.getElementById("paciente-select").value),
    data_agendamento: document.getElementById("data-agendamento").value,
    hora_agendamento: document.getElementById("hora-agendamento").value,
    servico: document.getElementById("servico").value.trim(),
    status: document.getElementById("status").value,
    observacoes: document.getElementById("agendamento-observacoes").value.trim() || null,
  };

  if (!agendamento.paciente_id || !agendamento.data_agendamento || !agendamento.hora_agendamento || !agendamento.servico) {
    alert("Preencha paciente, data, horário e tipo de serviço.");
    return;
  }

  let response;
  if (id) {
    response = await supabase.from("agendamentos").update(agendamento).eq("id", id);
  } else {
    response = await supabase.from("agendamentos").insert(agendamento);
  }

  handleError(response.error);
  if (!response.error) {
    agendamentoForm.reset();
    document.getElementById("agendamento-id").value = "";
    carregarAgendamentos(filtroData?.value, filtrarMes?.dataset.active === "true" ? "mes" : "dia");
  }
}

async function deletarAgendamento(id) {
  if (!confirm("Deseja realmente excluir este agendamento?")) {
    return;
  }

  const { error } = await supabase.from("agendamentos").delete().eq("id", id);
  handleError(error);
  if (!error) {
    carregarAgendamentos(filtroData?.value, filtrarMes?.dataset.active === "true" ? "mes" : "dia");
  }
}

agendamentosTbody?.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    const { data, error } = await supabase.from("agendamentos").select("*").eq("id", id).single();
    handleError(error);
    if (data) {
      preencherFormularioAgendamento(data);
    }
  }

  if (action === "delete") {
    deletarAgendamento(id);
  }
});

filtrarDia?.addEventListener("click", () => {
  filtrarMes.dataset.active = "false";
  carregarAgendamentos(filtroData?.value, "dia");
});

filtrarMes?.addEventListener("click", () => {
  filtrarMes.dataset.active = "true";
  carregarAgendamentos(filtroData?.value, "mes");
});

resetAgendamento?.addEventListener("click", () => {
  agendamentoForm.reset();
  document.getElementById("agendamento-id").value = "";
});

if (agendamentoForm) {
  agendamentoForm.addEventListener("submit", salvarAgendamento);
}

if (pacienteSelect) {
  carregarPacientesSelect();
}

if (agendamentosTbody) {
  carregarAgendamentos();
}
