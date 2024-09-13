document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos
    const reportTable = document.getElementById('report-table');
    const filterInput = document.getElementById('filter-input');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const csvButton = document.getElementById('csv-button');
    const rowsPerPage = 15;
    let currentPage = 1;

    // Variables globales
    let permisos = JSON.parse(localStorage.getItem('permisos')) || [];
    let filteredPermisos = permisos; // Definir aquí para que sea accesible globalmente

    console.log('Permisos cargados:', permisos);  // Depuración

    if (permisos.length === 0) {
        reportTable.innerHTML = '<tbody><tr><td colspan="10">No hay permisos registrados.</td></tr></tbody>';
        return;
    }

    // Función para actualizar la tabla
    const updateTable = () => {
        // Filtrar la tabla por texto y rango de fechas
        const filterTable = () => {
            const filter = filterInput.value.toLowerCase();
            const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
            const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

            filteredPermisos = permisos.filter(p => {
                const fechaSolicitud = p.fecha_solicitud ? new Date(p.fecha_solicitud) : null;
                const rowText = [
                    (p.fecha_solicitud || '').toLowerCase(),
                    (p.nombres_apellidos || '').toLowerCase(),
                    (p.cedula || '').toLowerCase(),
                    (p.fecha_permiso || '').toLowerCase(),
                    (p.hora_salida || '').toLowerCase(),
                    (p.hora_llegada || '').toLowerCase(),
                    (p.motivo_permiso || '').toLowerCase(),
                    (p.descontable || '').toLowerCase(),
                    (p.autorizado_por || '').toLowerCase(),
                    (p.observaciones || '').toLowerCase()
                ].join(' ');

                return rowText.includes(filter) &&
                       (!startDate || !fechaSolicitud || fechaSolicitud >= startDate) &&
                       (!endDate || !fechaSolicitud || fechaSolicitud <= endDate);
            });

            console.log('Permisos filtrados:', filteredPermisos);  // Depuración
            renderTable();
        };

        // Función para renderizar la tabla
        const renderTable = () => {
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const paginatedPermisos = filteredPermisos.slice(startIndex, endIndex);

            // Crear la tabla
            let tableHtml = '<thead><tr>';
            const headers = ['Fecha de Solicitud', 'Nombres y Apellidos', 'Cédula', 'Fecha del Permiso', 'Hora de Salida', 'Hora de Llegada', 'Motivo', 'Descantable', 'Autorizado Por', 'Observaciones'];
            headers.forEach(header => tableHtml += `<th>${header}</th>`);
            tableHtml += '</tr></thead><tbody>';

            if (paginatedPermisos.length === 0) {
                tableHtml += '<tr><td colspan="10">No hay datos disponibles.</td></tr>';
            } else {
                paginatedPermisos.forEach(p => {
                    tableHtml += '<tr>';
                    tableHtml += `<td>${p.fecha_solicitud || ''}</td>`;
                    tableHtml += `<td>${p.nombres_apellidos || ''}</td>`;
                    tableHtml += `<td>${p.cedula || ''}</td>`;
                    tableHtml += `<td>${p.fecha_permiso || ''}</td>`;
                    tableHtml += `<td>${p.hora_salida || ''}</td>`;
                    tableHtml += `<td>${p.hora_llegada || ''}</td>`;
                    tableHtml += `<td>${p.motivo_permiso || ''}</td>`;
                    tableHtml += `<td>${p.descontable || ''}</td>`;
                    tableHtml += `<td>${p.autorizado_por || ''}</td>`;
                    tableHtml += `<td>${p.observaciones || ''}</td>`;
                    tableHtml += '</tr>';
                });
            }

            tableHtml += '</tbody>';
            reportTable.innerHTML = tableHtml;
            renderPagination();
        };

        // Función para renderizar la paginación
        const renderPagination = () => {
            const paginationContainer = document.getElementById('pagination');
            const totalPages = Math.ceil(filteredPermisos.length / rowsPerPage);

            let paginationHtml = '';
            for (let i = 1; i <= totalPages; i++) {
                paginationHtml += `<button class="page-btn" data-page="${i}">${i}</button>`;
            }

            paginationContainer.innerHTML = paginationHtml;
            addPaginationEvents();
        };

        // Función para agregar eventos a los botones de paginación
        const addPaginationEvents = () => {
            const pageButtons = document.querySelectorAll('.page-btn');
            pageButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    currentPage = parseInt(e.target.getAttribute('data-page'), 10);
                    renderTable();
                });
            });
        };

        filterTable();
    };

    updateTable();

    // Función para exportar a CSV
    const exportToCSV = () => {
        const csv = Papa.unparse(filteredPermisos.map(p => ({
            'Fecha de Solicitud': p.fecha_solicitud || '',
            'Nombres y Apellidos': p.nombres_apellidos || '',
            'Cédula': p.cedula || '',
            'Fecha del Permiso': p.fecha_permiso || '',
            'Hora de Salida': p.hora_salida || '',
            'Hora de Llegada': p.hora_llegada || '',
            'Motivo': p.motivo_permiso || '',
            'Descantable': p.descontable || '',
            'Autorizado Por': p.autorizado_por || '',
            'Observaciones': p.observaciones || ''  // Asegúrate de que este campo esté presente
        }), {
            header: true,
            quotes: true,
            delimiter: ",",
            skipEmptyLines: true
        }));

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'permisos_report.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Crear un botón para descargar el CSV
    if (csvButton) {
        csvButton.addEventListener('click', exportToCSV);
    } else {
        console.error('Botón CSV no encontrado');
    }

    // Agregar eventos a los campos de filtro
    if (filterInput) {
        filterInput.addEventListener('input', updateTable);
    }
    if (startDateInput) {
        startDateInput.addEventListener('change', updateTable);
    }
    if (endDateInput) {
        endDateInput.addEventListener('change', updateTable);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    // Inicialmente oculta los enlaces
    sidebar.classList.add('hide-links');

    menuToggle.addEventListener('click', function() {
        // Alterna la clase `hide-links` en la barra lateral
        sidebar.classList.toggle('hide-links');
    });
});

