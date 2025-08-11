// Supongamos que tienes un arreglo o mapa con los clientes cargados
// clave = id del cliente, valor = nombre del cliente
const clientesMap = {};

// Al cargar los clientes en el selector también llenamos el mapa
fetch("/api/clientes")
    .then(res => res.json())
    .then(clientes => {
        const clienteSelect = document.getElementById("cliente");
        clientes.forEach(cliente => {
            // Guardamos en el mapa
            clientesMap[cliente.id] = cliente.nombre;

            // Agregamos la opción al select
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = cliente.nombre;
            clienteSelect.appendChild(option);
        });
    });

// Luego, al cargar los préstamos, usamos el nombre en vez del ID
fetch("/api/prestamos")
    .then(res => res.json())
    .then(data => {
        const tableBody = document.querySelector("#prestamosTable tbody");
        tableBody.innerHTML = "";

        data.forEach(prestamo => {
            const nombreCliente = clientesMap[prestamo.cliente_id] || `ID: ${prestamo.cliente_id}`;

            const row = `
                <tr>
                    <td class="py-2 px-4 border">${prestamo.id}</td>
                    <td class="py-2 px-4 border">${nombreCliente}</td>
                    <td class="py-2 px-4 border">${prestamo.monto}</td>
                    <td class="py-2 px-4 border">${prestamo.tasa_interes}</td>
                    <td class="py-2 px-4 border">${prestamo.observaciones || ""}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    });
