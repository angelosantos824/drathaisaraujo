// Script básico de autenticação usando Supabase Auth.
// Futuramente será possível controlar níveis de acesso e permissões.
const DEMO_USER = {
  email: "admin@drathaisaraujo.com.br",
  password: "Clinica2026!",
};
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Por favor, informe o e-mail e a senha.");
      return;
    }

    const supabaseNotConfigured =
      SUPABASE_URL.includes("your-project") ||
      SUPABASE_ANON_KEY.includes("YOUR_");

    if (supabaseNotConfigured) {
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        window.location.href = "dashboard.html";
        return;
      }

      alert(
        "O Supabase não está configurado. Use as credenciais de demonstração ou atualize js/config.js."
      );
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      handleError(error);
      return;
    }

    // Redireciona para o dashboard após login bem-sucedido.
    window.location.href = "dashboard.html";
  });
}
