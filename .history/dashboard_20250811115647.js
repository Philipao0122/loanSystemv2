const SUPABASE_URL = "https://TU_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
});

// Verificar si hay sesión
(async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html"; // Si no hay sesión, volver al login
  }
})();

// Cerrar sesión
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("supabase_session");
  window.location.href = "index.html";
});
