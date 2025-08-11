// Configuración de Supabase
const SUPABASE_URL = "https://noleinnqlvkpyopaqzmw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbGVpbm5xbHZrcHlvcGFxem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjczOTksImV4cCI6MjA3MDUwMzM5OX0.XJMLfy-P6JwOBsHQmailuILfuf1bbvCL2PQA3hC-37Y";
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
