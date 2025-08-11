document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.getElementById("prestamosTableBody");

    try {
        console.log('Iniciando carga de datos...');
        
        // 1. Primero verifiquemos la conexión con Supabase
        console.log('Verificando conexión con Supabase...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('Error de autenticación:', sessionError);
            throw new Error('Error de autenticación con Supabase');
        }
        
        console.log('Sesión de Supabase:', sessionData);
        
        // 2. Cargar préstamos con información de clientes
        console.log('Cargando datos de préstamos...');
        
        try {
            // Primero, obtener los préstamos
            const { data: prestamos, error: prestamosError } = await supabase
                .from('prestamos')
                .select('*')
                .order('fecha_creacion', { ascending: false });
                
            console.log('Préstamos obtenidos:', prestamos);
            
            if (prestamosError) throw prestamosError;
            
            // Si no hay préstamos, mostrar mensaje
            if (!prestamos || prestamos.length === 0) {
                console.log('No se encontraron préstamos en la base de datos');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-4 text-center text-gray-500">
                            No hay préstamos registrados en la base de datos
                        </td>
                    </tr>`;
                return;
            }
            
            // Obtener los IDs únicos de clientes
            const clienteIds = [...new Set(prestamos.map(p => p.cliente_id))];
            console.log('IDs de clientes a buscar:', clienteIds);
            
            // Obtener información de los clientes
            const { data: clientes, error: clientesError } = await supabase
                .from('clientes')
                .select('id, nombre, documento')
                .in('id', clienteIds);
                
            console.log('Clientes encontrados:', clientes);
            
            if (clientesError) throw clientesError;
            
            // Crear un mapa de clientes para búsqueda rápida
            const clienteMap = {};
            clientes.forEach(cliente => {
                clienteMap[cliente.id] = cliente;
            });
            
            // Agregar la información del cliente a cada préstamo
            const prestamosConClientes = prestamos.map(prestamo => ({
                ...prestamo,
                cliente: clienteMap[prestamo.cliente_id] || null
            }));
            
            console.log('Préstamos con información de clientes:', prestamosConClientes);
            
            // Actualizar la variable prestamos para usarla más adelante
            window.prestamos = prestamosConClientes;
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            throw new Error(`Error al cargar los datos: ${error.message}`);
        }

        // Limpiar la tabla
        tableBody.innerHTML = '';

        // Mostrar préstamos con nombre del cliente
        prestamos.forEach(prestamo => {
            console.log('Procesando préstamo:', prestamo);
            
            // Obtener datos del cliente
            const clienteData = prestamo.cliente || {};
            const clienteNombre = clienteData.nombre || 'Cliente no encontrado';
            const clienteDocumento = clienteData.documento ? `(${clienteData.documento})` : '';
            
            // Formatear fecha (usar created_at si existe, de lo contrario usar fecha actual)
            const fechaCreacion = prestamo.created_at || new Date().toISOString();
            const fechaFormateada = new Date(fechaCreacion).toLocaleDateString('es-ES');
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-2 px-4 border">${prestamo.id || 'N/A'}</td>
                <td class="py-2 px-4 border">
                    <div class="font-medium">${clienteNombre}</div>
                    ${clienteDocumento ? `<div class="text-sm text-gray-500">${clienteDocumento}</div>` : ''}
                    <div class="text-xs text-gray-400">ID: ${prestamo.cliente_id || 'N/A'}</div>
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

    } catch (error) {
        console.error("Error en la aplicación:", error);
        let errorMessage = 'Error al cargar los préstamos. Por favor recarga la página.';
        
        if (error.message) {
            errorMessage += `\n${error.message}`;
        }
        
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-red-600 whitespace-pre-line">
                    ${errorMessage}
                    <div class="mt-2 text-sm text-red-400">
                        Por favor revisa la consola para más detalles.
                    </div>
                </td>
            </tr>`;
    }
});
