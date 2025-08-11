// Configuración de Supabase
const SUPABASE_URL = "https://TU_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
});

// Revisar si ya hay sesión
(async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    window.location.href = "dashboard.html"; // Ya logueado
  }
})();

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById("error-msg").innerText = error.message;
  } else {
    localStorage.setItem("supabase_session", JSON.stringify(data.session));
    window.location.href = "dashboard.html";
  }
});
