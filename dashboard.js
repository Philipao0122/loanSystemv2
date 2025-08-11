// Configura tu conexión
const SUPABASE_URL = "https://noleinnqlvkpyopaqzmw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbGVpbm5xbHZrcHlvcGFxem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjczOTksImV4cCI6MjA3MDUwMzM5OX0.XJMLfy-P6JwOBsHQmailuILfuf1bbvCL2PQA3hC-37Y";
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
    // Formatear la fecha de creación
    const fechaCreacion = new Date(cliente.fecha_creacion || cliente.created_at || new Date().toISOString());
    const fechaFormateada = fechaCreacion.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

        // Mostrar información del cliente con botón de editar
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-bold text-gray-800">${cliente.nombre}</h3>
        <button class="editarBtn text-blue-500 hover:text-blue-700" data-id="${cliente.id}">
          ✏️ Editar
        </button>
      </div>
      <p class="text-gray-600">📞 ${cliente.telefono}</p>
      ${cliente.documento ? `<p class="text-gray-600">📝 ${cliente.documento}</p>` : ''}
      ${cliente.direccion ? `<p class="text-gray-600">🏠 ${cliente.direccion}</p>` : ''}
      <p class="text-sm text-gray-500 mt-2">Creado: ${fechaFormateada}</p>
    `;
    clientesList.appendChild(card);
  });
}

// Obtener referencias a los elementos del DOM
const submitBtn = document.getElementById("submitBtn");
const submitBtnText = document.getElementById("submitBtnText");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Función para limpiar el formulario
function limpiarFormulario() {
  document.getElementById("clienteForm").reset();
  document.getElementById("clienteId").value = "";
  submitBtnText.textContent = "➕ Guardar Cliente";
  cancelEditBtn.classList.add("hidden");
}

// Función para cargar los datos de un cliente en el formulario
function cargarClienteEnFormulario(cliente) {
  document.getElementById("clienteId").value = cliente.id;
  document.getElementById("nombre").value = cliente.nombre || "";
  document.getElementById("telefono").value = cliente.telefono || "";
  document.getElementById("documento").value = cliente.documento || "";
  document.getElementById("direccion").value = cliente.direccion || "";
  
  submitBtnText.textContent = "💾 Actualizar Cliente";
  cancelEditBtn.classList.remove("hidden");
  document.getElementById("nombre").focus();
}

// Función para verificar si el cliente ya existe
async function clienteExiste(telefono, documento) {
  const { data, error } = await supabaseClient
    .from('clientes')
    .select('telefono, documento')
    .or(`telefono.eq.${telefono}${documento ? `,documento.eq.${documento}` : ''}`);

  if (error) throw error;
  return data.length > 0;
}

// Función para insertar un nuevo cliente
async function insertarCliente() {
  const clienteData = {
    nombre: document.getElementById("nombre").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    documento: document.getElementById("documento").value.trim() || null,
    direccion: document.getElementById("direccion").value.trim() || null
  };

  // Validar campos requeridos
  if (!clienteData.nombre || !clienteData.telefono) {
    alert("Por favor complete los campos requeridos (Nombre y Teléfono)");
    return false;
  }

  // Verificar si el cliente ya existe (solo si no estamos editando)
  const clienteId = document.getElementById("clienteId").value;
  if (!clienteId) {
    const existe = await clienteExiste(clienteData.telefono, clienteData.documento);
    if (existe) {
      alert("Ya existe un cliente con el mismo teléfono o documento");
      return false;
    }
  }

  // Insertar o actualizar el cliente
  let error;
  if (clienteId) {
    // Actualizar cliente existente
    const { data, error: updateError } = await supabaseClient
      .from("clientes")
      .update(clienteData)
      .eq("id", clienteId);
    error = updateError;
  } else {
    // Insertar nuevo cliente
    const { data, error: insertError } = await supabaseClient
      .from("clientes")
      .insert([clienteData]);
    error = insertError;
  }

  if (error) throw error;
  
  cargarClientes();
  return true;
}

// Evento para guardar cliente
clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  
  try {
    const exito = await insertarCliente();
    if (exito) {
      limpiarFormulario();
    }
  } catch (error) {
    console.error("Error al guardar el cliente:", error);
    alert("Error al guardar el cliente: " + error.message);
  } finally {
    submitBtn.disabled = false;
  }
});

// Evento para el botón de cancelar edición
cancelEditBtn.addEventListener("click", () => {
  limpiarFormulario();
});

// Evento delegado para los botones de editar
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("editarBtn")) {
    const card = e.target.closest("[data-id]");
    const clienteId = card ? card.getAttribute("data-id") : e.target.getAttribute("data-id");
    
    try {
      const { data: cliente, error } = await supabaseClient
        .from("clientes")
        .select("*")
        .eq("id", clienteId)
        .single();

      if (error) throw error;
      
      cargarClienteEnFormulario(cliente);
      // Desplazar hacia el formulario para mejor UX
      document.getElementById("clienteForm").scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error al cargar el cliente:", error);
      alert("No se pudo cargar el cliente para editar");
    }
  }
});

// Inicializar
cargarClientes();
