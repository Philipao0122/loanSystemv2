// Wait for both DOM and Supabase to be ready
const initLoanSystem = async () => {
    const form = document.getElementById("prestamoForm");
    const clienteSelect = document.getElementById("cliente");
    const submitBtn = form?.querySelector("button[type='submit']");

    // Check if we're on the right page
    if (!form || !clienteSelect || !submitBtn) {
        console.log('Loan form elements not found, skipping initialization');
        return;
    }

    // Wait for Supabase to be available
    const waitForSupabase = () => {
        return new Promise((resolve) => {
            if (window.supabase) return resolve(window.supabase);
            
            const checkInterval = setInterval(() => {
                if (window.supabase) {
                    clearInterval(checkInterval);
                    resolve(window.supabase);
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(null);
            }, 5000);
        });
    };

    // Show loading state
    const setLoading = (isLoading) => {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading">Cargando...</span>';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrar Préstamo';
        }
    };

    // Show message to user
    const mostrarMensaje = (texto, tipo = "success") => {
        const existingMessages = document.querySelectorAll('.flash-message');
        existingMessages.forEach(msg => msg.remove());

        const msg = document.createElement("div");
        msg.className = `flash-message fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white z-50 ${
            tipo === "success" ? "bg-green-500" : "bg-red-500"
        } transition-opacity duration-300 opacity-0`;
        
        msg.textContent = texto;
        document.body.appendChild(msg);
        
        // Trigger reflow
        void msg.offsetWidth;
        msg.classList.remove('opacity-0');
        
        setTimeout(() => {
            msg.classList.add('opacity-0');
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    };

    // Load clients
    const cargarClientes = async () => {
        try {
            const supabase = window.supabase;
            if (!supabase) throw new Error('Error al conectar con la base de datos');
            
            setLoading(true);
            
            const { data, error } = await supabase
                .from("clientes")
                .select("id, nombre, documento")
                .order("nombre", { ascending: true });

            if (error) throw error;
            if (!data || data.length === 0) {
                mostrarMensaje("No se encontraron clientes", "error");
                return;
            }

            clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
            data.forEach(cliente => {
                const option = document.createElement("option");
                option.value = cliente.id;
                option.textContent = `${cliente.nombre}${cliente.documento ? ` (${cliente.documento})` : ''}`;
                clienteSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading clients:", error);
            mostrarMensaje("Error al cargar los clientes: " + (error.message || 'Error desconocido'), "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!clienteSelect.value) {
            return mostrarMensaje("Por favor seleccione un cliente", "error");
        }
        
        const monto = parseFloat(document.getElementById("monto")?.value);
        if (isNaN(monto) || monto <= 0) {
            return mostrarMensaje("Ingrese un monto válido", "error");
        }
        
        const tasaInteres = parseFloat(document.getElementById("tasa_interes")?.value);
        if (isNaN(tasaInteres) || tasaInteres < 0) {
            return mostrarMensaje("Ingrese una tasa de interés válida", "error");
        }

        try {
            setLoading(true);
            
            const { error } = await window.supabase
                .from("prestamos")
                .insert([{
                    cliente_id: clienteSelect.value,
                    monto: monto,
                    tasa_interes: tasaInteres,
                    observaciones: document.getElementById("observaciones")?.value || null,
                    fecha_creacion: new Date().toISOString()
                }]);

            if (error) throw error;
            
            mostrarMensaje("Préstamo registrado exitosamente", "success");
            form.reset();
        } catch (error) {
            console.error("Error al guardar el préstamo:", error);
            mostrarMensaje("Error al guardar el préstamo: " + (error.message || 'Error desconocido'), "error");
        } finally {
            setLoading(false);
        }
    };

    // Initialize the page
    const init = async () => {
        const supabase = await waitForSupabase();
        if (!supabase) {
            mostrarMensaje("Error al conectar con la base de datos", "error");
            return;
        }
        
        form.addEventListener("submit", handleSubmit);
        await cargarClientes();
    };

    // Start initialization
    init();
};

// Start the loan system when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoanSystem);
} else {
    initLoanSystem();
}
