const supabaseUrl = "https://noleinnqlvkpyopaqzmw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbGVpbm5xbHZrcHlvcGFxem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjczOTksImV4cCI6MjA3MDUwMzM5OX0.XJMLfy-P6JwOBsHQmailuILfuf1bbvCL2PQA3hC-37Y";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("prestamoForm");
const clienteSelect = document.getElementById("cliente");
const submitBtn = form.querySelector("button[type='submit']");

// Cargar clientes
async function cargarClientes() {
    try {
        let { data, error } = await supabase
            .from("clientes")
            .select("id, nombre, documento")
            .order("nombre", { ascending: true });

        if (error) throw error;

        clienteSelect.innerHTML = `<option value="">Seleccione un cliente</option>`;
        data.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.nombre} ${c.documento ? `(ID: ${c.documento})` : ""}`;
            clienteSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Error cargando clientes:", err.message);
        mostrarMensaje("Error cargando clientes", "error");
    }
}

// Insertar préstamo
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validaciones
    if (!clienteSelect.value) return mostrarMensaje("Seleccione un cliente", "error");
    if (!document.getElementById("monto").value) return mostrarMensaje("Ingrese un monto", "error");
    if (!document.getElementById("tasa_interes").value) return mostrarMensaje("Ingrese una tasa de interés", "error");

    // Bloquear botón
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    const nuevoPrestamo = {
        cliente_id: clienteSelect.value, // UUID como string
        monto: parseFloat(document.getElementById("monto").value),
        tasa_interes: parseFloat(document.getElementById("tasa_interes").value),
        observaciones: document.getElementById("observaciones").value || null
    };

    let { error } = await supabase.from("prestamos").insert([nuevoPrestamo]);

    if (error) {
        mostrarMensaje("Error al guardar el préstamo: " + error.message, "error");
    } else {
        mostrarMensaje("Préstamo guardado con éxito", "success");
        form.reset();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Registrar Préstamo";
});

// Función de mensajes bonitos
function mostrarMensaje(texto, tipo = "success") {
    const msg = document.createElement("div");
    msg.textContent = texto;
    msg.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white 
        ${tipo === "success" ? "bg-green-500" : "bg-red-500"} transition`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

cargarClientes();
