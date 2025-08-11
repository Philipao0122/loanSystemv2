document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("prestamosTableBody");
    
    // Mostrar mensaje de carga
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="py-4 text-center text-gray-500">
                Cargando préstamos...
            </td>
        </tr>`;

    // Esperar a que el cliente de Supabase esté disponible
    const checkSupabase = setInterval(() => {
        if (window.supabase) {
            clearInterval(checkSupabase);
            cargarPrestamos();
        }
    }, 100);

    // Función para cargar préstamos
    async function cargarPrestamos() {
        const supabase = window.supabase;
        try {
            console.log('Cargando préstamos con información de clientes...');
            
            // Obtener préstamos con la información del cliente usando una relación
            const { data: prestamos, error } = await supabase
                .from('prestamos')
                .select(`
                    *,
                    cliente:clientes (id, nombre, documento)
                `)
                .order('fecha_creacion', { ascending: false });

            if (error) {
                console.error('Error al cargar préstamos:', error);
                throw error;
            }

            console.log('Préstamos cargados:', prestamos);
            
            // Limpiar la tabla
            tableBody.innerHTML = '';

            if (!prestamos || prestamos.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="py-4 text-center text-gray-500">
                            No hay préstamos registrados
                        </td>
                    </tr>`;
                return;
            }

            // Mostrar los préstamos
            prestamos.forEach(prestamo => {
                const fecha = prestamo.fecha_creacion ? new Date(prestamo.fecha_creacion) : new Date();
                const fechaFormateada = fecha.toLocaleDateString('es-ES');
                const cliente = Array.isArray(prestamo.cliente) ? prestamo.cliente[0] : prestamo.cliente;
                const nombreCliente = cliente?.nombre || 'Cliente no encontrado';
                const documentoCliente = cliente?.documento ? `(${cliente.documento})` : '';
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="py-2 px-4 border">
                        <div class="font-medium">${nombreCliente}</div>
                        ${documentoCliente ? `<div class="text-sm text-gray-500">${documentoCliente}</div>` : ''}
                    </td>
                    <td class="py-2 px-4 border text-right">$${Number(prestamo.monto || 0).toLocaleString('es-CO')}</td>
                    <td class="py-2 px-4 border text-center">${prestamo.tasa_interes || 0}%</td>
                    <td class="py-2 px-4 border">
                        <div>${prestamo.observaciones || ''}</div>
                        <div class="text-xs text-gray-400">${fechaFormateada}</div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            console.log('Préstamos mostrados correctamente');
            
        } catch (error) {
            console.error('Error al cargar préstamos:', error);
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-4 text-center text-red-600">
                        Error al cargar los préstamos
                        <div class="text-sm text-red-400 mt-1">
                            ${error.message || 'Por favor recarga la página'}
                        </div>
                    </td>
                </tr>`;
        }
    }
});
