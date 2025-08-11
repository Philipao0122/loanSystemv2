// Obtener referencias
const tableBody = document.getElementById("prestamosTableBody");

// Cargar préstamos y nombres de clientes
Promise.all([
    fetch("/api/prestamos").then(res => res.json()),
    fetch("/api/clientes").then(res => res.json())
]).then(([prestamos, clientes]) => {

    // Crear mapa id -> nombre
    const clienteMap = {};
    clientes.forEach(c => {
        clienteMap[c.id] = c.nombre;
    });

    // Pintar tabla
    prestamos.forEach(prestamo => {
        const row = `
            <tr>
                <td class="py-2 px-4 border">${prestamo.id}</td>
                <td class="py-2 px-4 border">${clienteMap[prestamo.cliente_id] || "Desconocido"}</td>
                <td class="py-2 px-4 border">${prestamo.monto}</td>
                <td class="py-2 px-4 border">${prestamo.tasa_interes}</td>
                <td class="py-2 px-4 border">${prestamo.observaciones || ""}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
});
