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
        
        // 2. Cargar préstamos y clientes
        console.log('Cargando datos de préstamos y clientes...');
        const [prestamosResponse, clientesResponse] = await Promise.all([
            supabase
                .from('prestamos')
                .select('*')
                .order('fecha_creacion', { ascending: false }),
            supabase
                .from('clientes')
                .select('id, nombre, documento')
        ]);
        
        console.log('Respuesta de préstamos:', prestamosResponse);
        console.log('Respuesta de clientes:', clientesResponse);

        if (prestamosResponse.error) {
            console.error('Error en la consulta de préstamos:', prestamosResponse.error);
            throw new Error(`Error al cargar préstamos: ${prestamosResponse.error.message}`);
        }
        
        if (clientesResponse.error) {
            console.error('Error en la consulta de clientes:', clientesResponse.error);
            throw new Error(`Error al cargar clientes: ${clientesResponse.error.message}`);
        }

        const prestamos = prestamosResponse.data;
        const clientes = clientesResponse.data;

        // Crear un mapa rápido de cliente_id -> datos del cliente
        const clienteMap = {};
        clientes.forEach(cliente => {
            clienteMap[cliente.id] = {
                nombre: cliente.nombre,
                documento: cliente.documento ? `(${cliente.documento})` : ''
            };
        });

        // Limpiar la tabla
        tableBody.innerHTML = '';

        if (prestamos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-4 text-center text-gray-500">
                        No hay préstamos registrados
                    </td>
                </tr>
            `;
            return;
        }

        // Mostrar préstamos con nombre del cliente
        prestamos.forEach(prestamo => {
            const cliente = clienteMap[prestamo.cliente_id] || { nombre: 'Cliente no encontrado', documento: '' };
            const fecha = new Date(prestamo.fecha_creacion).toLocaleDateString('es-ES');
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-2 px-4 border">${prestamo.id}</td>
                <td class="py-2 px-4 border">
                    <div class="font-medium">${cliente.nombre}</div>
                    ${cliente.documento ? `<div class="text-sm text-gray-500">${cliente.documento}</div>` : ''}
                </td>
                <td class="py-2 px-4 border text-right">$${Number(prestamo.monto).toLocaleString('es-CO')}</td>
                <td class="py-2 px-4 border text-center">${prestamo.tasa_interes}%</td>
                <td class="py-2 px-4 border">${prestamo.observaciones || ''}</td>
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
