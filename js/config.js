// Configuração de conexão com Supabase
// Substitua com suas variáveis de ambiente reais no ambiente de produção.
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Inicializa cliente Supabase para uso em todos os módulos.
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para formatar valores monetários em real.
function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

// Função para manipular erros de Supabase e mostrar mensagens simples.
function handleError(error) {
  if (error) {
    console.error(error);
    alert(error.message || "Ocorreu um erro no Supabase.");
  }
}
