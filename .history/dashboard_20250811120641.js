// Configura tu conexión
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_KEY = "TU_API_KEY_PUBLICA";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del DOM
const clienteForm = document.getElementById("clienteForm");
const clientesList = document.getElementById("clientesList");

// Función para mostrar clientes
async function cargarClientes() {
  clientesList.innerHTML = "<p class='col-span-full text-gray-500'>Cargando...</p>";
  
  const { data, error } = await supabaseClient.from("clientes").select("*").order("id", { ascending: false });

  if (error) {
    clientesList.innerHTML = `<p class='text-red-500 col-span-full'>Error: ${error.message}</p>`;
    return;
  }

  if (data.length === 0) {
    clientesList.innerHTML = "<p class='col-span-full text-gray-500'>No hay clientes registrados.</p>";
    return;
  }

  clientesList.innerHTML = "";
  data.forEach(cliente => {
    const card = document.createElement("div");
    card.className = "bg-blue-50 border rounded-lg p-4 shadow hover:shadow-md transition";
    card.innerHTML = `
      <h3 class="text-lg font-bold text-gray-800">${cliente.nombre} ${cliente.apellido}</h3>
      <p class="text-gray-600">📧 ${cliente.email}</p>
      <p class="text-gray-600">📞 ${cliente.telefono}</p>
    `;
    clientesList.appendChild(card);
  });
}

// Evento para guardar cliente
clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  const { error } = await supabaseClient.from("clientes").insert([{ nombre, apellido, email, telefono }]);

  if (error) {
    alert("Error al guardar cliente: " + error.message);
    return;
  }

  clienteForm.reset();
  cargarClientes();
});

// Inicializar
cargarClientes();
