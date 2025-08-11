// Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase configuration. Please check your .env file');
  document.body.innerHTML = `
    <div class="p-4 bg-red-100 text-red-700 rounded-lg">
      <h2 class="font-bold">Error de Configuración</h2>
      <p>Faltan las credenciales de Supabase. Por favor verifica tu archivo .env</p>
    </div>
  `;
  throw new Error('Missing Supabase configuration');
}

// Initialize Supabase client
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true }
});

// Initialize app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Check if Supabase is properly initialized
    if (typeof window.supabase?.from !== 'function') {
      throw new Error('Error al inicializar el cliente de Supabase');
    }
    
    console.log('Supabase client initialized in app.js');
    initApp();
  } catch (error) {
    console.error('Error initializing app:', error);
    const appContainer = document.getElementById('app') || document.body;
    appContainer.innerHTML = `
      <div class="p-4 bg-red-100 text-red-700 rounded-lg">
        <h2 class="font-bold">Error de Inicialización</h2>
        <p>${error.message}</p>
        <p>Por favor recarga la página o contacta al soporte.</p>
      </div>
    `;
  }
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
