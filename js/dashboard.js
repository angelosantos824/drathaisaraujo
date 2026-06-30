// Dashboard inicial que busca resumos do banco Supabase.
const totalPacientes = document.getElementById("total-pacientes");
const totalAgendamentos = document.getElementById("total-agendamentos");
const totalEntradas = document.getElementById("total-entradas");
const totalSaidas = document.getElementById("total-saidas");
const saldoMensal = document.getElementById("saldo-mensal");

async function carregarDashboard() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const [{ data: pacientes }, { data: agendamentos }, { data: entradas }, { data: saidas }] =
    await Promise.all([
      supabase.from("pacientes").select("id", { count: "exact" }),
      supabase
        .from("agendamentos")
        .select("id")
        .gte("data_agendamento", `${year}-${String(month).padStart(2, "0")}-01`)
        .lte("data_agendamento", `${year}-${String(month).padStart(2, "0")}-31`),
      supabase
        .from("fluxo_caixa")
        .select("valor")
        .eq("tipo", "entrada")
        .gte("data", `${year}-${String(month).padStart(2, "0")}-01`)
        .lte("data", `${year}-${String(month).padStart(2, "0")}-31`),
      supabase
        .from("fluxo_caixa")
        .select("valor")
        .eq("tipo", "saida")
        .gte("data", `${year}-${String(month).padStart(2, "0")}-01`)
        .lte("data", `${year}-${String(month).padStart(2, "0")}-31`),
    ]);

  handleError(pacientes?.error || agendamentos?.error || entradas?.error || saidas?.error);

  totalPacientes.textContent = pacientes?.count || 0;
  totalAgendamentos.textContent = agendamentos?.length || 0;
  const somaEntradas = entradas?.reduce((sum, item) => sum + Number(item.valor || 0), 0) || 0;
  const somaSaidas = saidas?.reduce((sum, item) => sum + Number(item.valor || 0), 0) || 0;

  totalEntradas.textContent = formatMoney(somaEntradas);
  totalSaidas.textContent = formatMoney(somaSaidas);
  saldoMensal.textContent = formatMoney(somaEntradas - somaSaidas);
}

if (totalPacientes) {
  carregarDashboard();
}
