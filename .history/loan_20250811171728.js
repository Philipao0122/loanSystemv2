document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("prestamoForm");
    const clienteSelect = document.getElementById("cliente");
    const submitBtn = form?.querySelector("button[type='submit']");

    // Esperar a que el cliente de Supabase esté disponible
    const checkSupabase = setInterval(() => {
        if (window.supabase) {
            clearInterval(checkSupabase);
            initLoanPage();
        }
    }, 100);

    function initLoanPage() {
        const supabase = window.supabase;
        // Cargar clientes
        cargarClientes();
        
        // Configurar el manejador del formulario
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                await insertarPrestamo();
            });
        }
    }

    // Cargar clientes
    async function cargarClientes() {
        const supabase = window.supabase;
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

    // Función para insertar préstamo
    async function insertarPrestamo() {
        if (!form || !submitBtn) return;
        
        const supabase = window.supabase;
        const btnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Procesando...';

        try {
            const nuevoPrestamo = {
                cliente_id: clienteSelect.value,
                monto: parseFloat(document.getElementById("monto").value),
                tasa_interes: parseFloat(document.getElementById("tasa_interes").value),
                observaciones: document.getElementById("observaciones").value || null
            };

            const { error } = await supabase
                .from("prestamos")
                .insert([nuevoPrestamo]);

            if (error) throw error;

            mostrarMensaje("Préstamo creado exitosamente");
            form.reset();
        } catch (error) {
            console.error("Error al crear préstamo:", error);
            mostrarMensaje("Error al crear el préstamo: " + error.message, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnText;
        }
    }

    // Función de mensajes bonitos
    function mostrarMensaje(texto, tipo = "success") {
        const mensaje = document.createElement("div");
        mensaje.className = `p-4 mb-4 rounded ${tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
        mensaje.textContent = texto;
        
        const container = document.querySelector(".container");
        container.insertBefore(mensaje, container.firstChild);
        
        setTimeout(() => {
            mensaje.remove();
        }, 5000);
    }
});
