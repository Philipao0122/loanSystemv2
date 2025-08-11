const supabaseUrl = "https://noleinnqlvkpyopaqzmw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbGVpbm5xbHZrcHlvcGFxem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjczOTksImV4cCI6MjA3MDUwMzM5OX0.XJMLfy-P6JwOBsHQmailuILfuf1bbvCL2PQA3hC-37Y";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("prestamoForm");
const clienteSelect = document.getElementById("cliente");

// Cargar clientes desde DB
async function cargarClientes() {
    let { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, documento")
        .order("nombre", { ascending: true });

    if (error) {
        console.error("Error cargando clientes:", error);
        return;
    }

    data.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = `${c.nombre} (ID: ${c.documento})`;
        clienteSelect.appendChild(option);
    });
}

// Insertar préstamo
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoPrestamo = {
        cliente_id: parseInt(clienteSelect.value),
        monto: parseFloat(document.getElementById("monto").value),
        interes: parseFloat(document.getElementById("interes").value),
        observaciones: document.getElementById("observaciones").value || null
    };

    let { error } = await supabase
        .from("prestamos")
        .insert([nuevoPrestamo]);

    if (error) {
        alert("Error al guardar el préstamo: " + error.message);
    } else {
        alert("Préstamo guardado con éxito");
        form.reset();
    }
});

cargarClientes();
