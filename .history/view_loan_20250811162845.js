document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("prestamosTableBody");

    // Cargar préstamos y clientes
    Promise.all([
        fetch("/api/prestamos").then(res => res.json()),
        fetch("/api/clientes").then(res => res.json())
    ])
    .then(([prestamos, clientes]) => {
        // Crear un mapa rápido de cliente_id -> nombre
        const clienteMap = {};
        clientes.forEach(cliente => {
            clienteMap[cliente.id] = cliente.nombre; // Aquí usamos la columna 'nombre'
        });

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
    })
    .catch(error => {
        console.error("Error cargando datos:", error);
    });
});
