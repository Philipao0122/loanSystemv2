document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.getElementById("prestamosTableBody");

    try {
        // Cargar préstamos y clientes usando Supabase
        const [prestamosResponse, clientesResponse] = await Promise.all([
            supabase.from('prestamos').select('*'),
            supabase.from('clientes').select('*')
        ]);

        if (prestamosResponse.error) throw prestamosResponse.error;
        if (clientesResponse.error) throw clientesResponse.error;

        const prestamos = prestamosResponse.data;
        const clientes = clientesResponse.data;

        // Crear un mapa rápido de cliente_id -> nombre
        const clienteMap = {};
        clientes.forEach(cliente => {
            clienteMap[cliente.id] = cliente.nombre;
        });

        // Limpiar la tabla antes de agregar nuevas filas
        tableBody.innerHTML = '';

        // Mostrar préstamos con nombre del cliente
        prestamos.forEach(prestamo => {
            const nombreCliente = clienteMap[prestamo.cliente_id] || "Desconocido";

            const row = `
                <tr>
                    <td class="py-2 px-4 border">${prestamo.id}</td>
                    <td class="py-2 px-4 border">${nombreCliente} (${prestamo.cliente_id})</td>
                    <td class="py-2 px-4 border">${prestamo.monto}</td>
                    <td class="py-2 px-4 border">${prestamo.tasa_interes}</td>
                    <td class="py-2 px-4 border">${prestamo.observaciones || ""}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error cargando datos:", error);
        // Mostrar mensaje de error en la interfaz
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="py-2 px-4 border text-red-600">
                    Error al cargar los datos. Por favor recarga la página.
                </td>
            </tr>
        `;
    }
});
