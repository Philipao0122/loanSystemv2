// Configuración de Supabase
const SUPABASE_URL = "https://noleinnqlvkpyopaqzmw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbGVpbm5xbHZrcHlvcGFxem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjczOTksImV4cCI6MjA3MDUwMzM5OX0.XJMLfy-P6JwOBsHQmailuILfuf1bbvCL2PQA3hC-37Y";

// Initialize Supabase client when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Use the global supabase object from the CDN
  const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true }
  });
  
  // Make supabase available globally
  window.supabase = _supabase;
  
  // Initialize the rest of the app
  initApp();
});

// Función para cerrar sesión
async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("supabase_session");
    window.location.href = "index.html";
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión: ' + error.message);
  }
}

async function initApp() {
  // Configurar botón de cierre de sesión si existe
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Revisar si ya hay sesión
  const { data } = await supabase.auth.getSession();
  if (data.session && !window.location.pathname.endsWith('index.html')) {
    // Si hay sesión y no estamos en la página de login, redirigir al dashboard
    if (window.location.pathname.endsWith('index.html')) {
      window.location.href = "dashboard.html";
    }
  } else if (!data.session && !window.location.pathname.endsWith('index.html')) {
    // Si no hay sesión y no estamos en la página de login, redirigir al login
    window.location.href = "index.html";
    return;
  }

  // Login form handler
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) throw error;
      
      localStorage.setItem("supabase_session", JSON.stringify(data.session));
      window.location.href = "dashboard.html";
    } catch (error) {
      document.getElementById("error-msg").textContent = error.message;
    }
  });
}
