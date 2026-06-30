// Relatórios mensais de entradas, saídas e saldo com filtros extras.
const relatorioMes = document.getElementById("relatorio-mes");
const relatorioAno = document.getElementById("relatorio-ano");
const relatorioCategoria = document.getElementById("relatorio-categoria");
const relatorioPagamento = document.getElementById("relatorio-pagamento");
const relatorioTabela = document.getElementById("relatorio-tabela");
const relatorioTotalEntradas = document.getElementById("relatorio-total-entradas");
const relatorioTotalSaidas = document.getElementById("relatorio-total-saidas");
const relatorioSaldo = document.getElementById("relatorio-saldo");

async function carregarCategoriasRelatorio() {
  const { data, error } = await supabase.from("categorias_financeiras").select("id, nome").order("nome");
  handleError(error);

  if (!relatorioCategoria) return;
  relatorioCategoria.innerHTML = "<option value=\"\">Todas as categorias</option>";
  data?.forEach((categoria) => {
    relatorioCategoria.innerHTML += `<option value="${categoria.id}">${categoria.nome}</option>`;
  });
}

async function carregarRelatorio() {
  const mes = relatorioMes?.value;
  const ano = relatorioAno?.value;
  if (!mes || !ano) {
    return;
  }

  const mesStr = String(mes).padStart(2, "0");
  let query = supabase
    .from("fluxo_caixa")
    .select("*, categoria:categoria_id (nome)")
    .gte("data", `${ano}-${mesStr}-01`)
    .lte("data", `${ano}-${mesStr}-31`)
    .order("data", { ascending: true });

  if (relatorioCategoria?.value) {
    query = query.eq("categoria_id", relatorioCategoria.value);
  }

  if (relatorioPagamento?.value) {
    query = query.eq("forma_pagamento", relatorioPagamento.value);
  }

  const { data, error } = await query;
  handleError(error);

  relatorioTabela.innerHTML = "";
  const entradas = data?.filter((item) => item.tipo === "entrada") || [];
  const saidas = data?.filter((item) => item.tipo === "saida") || [];

  data?.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.data}</td>
      <td>${item.tipo}</td>
      <td>${item.categoria?.nome || "-"}</td>
      <td>${item.forma_pagamento}</td>
      <td>${formatMoney(item.valor)}</td>
      <td>${item.descricao || "-"}</td>
    `;
    relatorioTabela.appendChild(row);
  });

  const totalEntrada = entradas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const totalSaida = saidas.reduce((sum, item) => sum + Number(item.valor || 0), 0);

  relatorioTotalEntradas.textContent = formatMoney(totalEntrada);
  relatorioTotalSaidas.textContent = formatMoney(totalSaida);
  relatorioSaldo.textContent = formatMoney(totalEntrada - totalSaida);
}

if (relatorioMes && relatorioAno) {
  relatorioMes.addEventListener("change", carregarRelatorio);
  relatorioAno.addEventListener("change", carregarRelatorio);
  relatorioCategoria?.addEventListener("change", carregarRelatorio);
  relatorioPagamento?.addEventListener("change", carregarRelatorio);
}

if (relatorioTabela) {
  const hoje = new Date();
  relatorioMes.value = String(hoje.getMonth() + 1).padStart(2, "0");
  relatorioAno.value = String(hoje.getFullYear());
  carregarCategoriasRelatorio().then(carregarRelatorio);
}
