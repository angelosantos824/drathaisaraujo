// Gerenciamento de pacientes: criar, ler, atualizar e deletar.
const pacientesTbody = document.getElementById("pacientes-tbody");
const pacienteForm = document.getElementById("paciente-form");
const filtroPacientes = document.getElementById("filtro-pacientes");
const resetPaciente = document.getElementById("reset-paciente");

async function carregarPacientes() {
  const filtro = filtroPacientes?.value.trim();
  let query = supabase.from("pacientes").select("*").order("created_at", { ascending: false });

  if (filtro) {
    query = query.ilike("nome", `%${filtro}%`).or(`telefone.ilike.%${filtro}%`);
  }

  const { data, error } = await query;
  handleError(error);

  pacientesTbody.innerHTML = "";
  data?.forEach((paciente) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.telefone}</td>
      <td>${paciente.data_nascimento}</td>
      <td>${paciente.cpf || "-"}</td>
      <td>
        <button class="button button-outline" data-id="${paciente.id}" data-action="edit">Editar</button>
        <button class="button button-outline" data-id="${paciente.id}" data-action="delete">Excluir</button>
      </td>
    `;
    pacientesTbody.appendChild(row);
  });
}

async function preencherFormulario(paciente) {
  document.getElementById("paciente-id").value = paciente.id;
  document.getElementById("nome").value = paciente.nome;
  document.getElementById("telefone").value = paciente.telefone;
  document.getElementById("nascimento").value = paciente.data_nascimento;
  document.getElementById("cpf").value = paciente.cpf || "";
  document.getElementById("endereco").value = paciente.endereco || "";
  document.getElementById("observacoes").value = paciente.observacoes || "";
}

async function salvarPaciente(event) {
  event.preventDefault();

  const id = document.getElementById("paciente-id").value;
  const paciente = {
    nome: document.getElementById("nome").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    data_nascimento: document.getElementById("nascimento").value,
    cpf: document.getElementById("cpf").value.trim() || null,
    endereco: document.getElementById("endereco").value.trim() || null,
    observacoes: document.getElementById("observacoes").value.trim() || null,
  };

  if (!paciente.nome || !paciente.telefone || !paciente.data_nascimento) {
    alert("Nome, telefone e data de nascimento são obrigatórios.");
    return;
  }

  let response;
  if (id) {
    response = await supabase.from("pacientes").update(paciente).eq("id", id);
  } else {
    response = await supabase.from("pacientes").insert(paciente);
  }

  handleError(response.error);
  if (!response.error) {
    pacienteForm.reset();
    document.getElementById("paciente-id").value = "";
    carregarPacientes();
  }
}

async function deletarPaciente(id) {
  if (!confirm("Deseja realmente excluir este paciente?")) {
    return;
  }

  const { error } = await supabase.from("pacientes").delete().eq("id", id);
  handleError(error);
  if (!error) {
    carregarPacientes();
  }
}

pacientesTbody?.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    const { data, error } = await supabase.from("pacientes").select("*").eq("id", id).single();
    handleError(error);
    if (data) {
      preencherFormulario(data);
    }
  }

  if (action === "delete") {
    deletarPaciente(id);
  }
});

filtroPacientes?.addEventListener("input", () => carregarPacientes());
resetPaciente?.addEventListener("click", () => {
  pacienteForm.reset();
  document.getElementById("paciente-id").value = "";
});

if (pacienteForm) {
  pacienteForm.addEventListener("submit", salvarPaciente);
}

if (pacientesTbody) {
  carregarPacientes();
}
