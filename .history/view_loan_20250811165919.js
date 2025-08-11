document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("prestamosTableBody");
    
    // Mostrar mensaje de carga
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="py-4 text-center text-gray-500">
                Cargando préstamos...
            </td>
        </tr>`;

    // Cargar préstamos
    cargarPrestamos();

    // Función para cargar préstamos
    async function cargarPrestamos() {
        try {
            console.log('Cargando préstamos...');
            
            // Obtener préstamos usando la misma lógica que en dashboard.js
            const { data: prestamos, error } = await supabase
                .from('prestamos')
                .select('*')
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
                        <td colspan="5" class="py-4 text-center text-gray-500">
                            No hay préstamos registrados
                        </td>
                    </tr>`;
                return;
            }

            // Mostrar los préstamos
            prestamos.forEach(prestamo => {
                const fecha = prestamo.fecha_creacion ? new Date(prestamo.fecha_creacion) : new Date();
                const fechaFormateada = fecha.toLocaleDateString('es-ES');
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="py-2 px-4 border">${prestamo.id || 'N/A'}</td>
                    <td class="py-2 px-4 border">
                        <div class="font-medium">ID Cliente: ${prestamo.cliente_id || 'N/A'}</div>
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
