document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const reportTable = document.getElementById('report-table');
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');
    const filterInput = document.getElementById('filter-input');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const rowsPerPage = 15;
    let currentPage = 1;
    let permisos = JSON.parse(localStorage.getItem('permisos')) || [];
    let filteredPermisos = permisos;
    

    sidebar.classList.add('hide-links');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hide-links');
    });

    // Función para actualizar la tabla y el gráfico
    const updateTableAndChart = () => {
        filterTable();
        updateChart();
    };

    // Función para filtrar la tabla por texto y rango de fechas
    const filterTable = () => {
        if (!filterInput) return; // Verificar existencia del elemento

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

        renderTable();
    };

    // Función para renderizar la tabla con los permisos filtrados
    const renderTable = () => {
        if (!reportTable) return; // Verificar existencia del elemento

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedPermisos = filteredPermisos.slice(startIndex, endIndex);

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

        // Actualizar el gráfico después de renderizar la tabla
        updateChart();
    };

    // Función para actualizar el gráfico con los datos filtrados
    const updateChart = () => {
        if (!canvas || !ctx) return; // Verificar existencia del canvas y contexto

        const countsByMonth = {};

        filteredPermisos.forEach(permiso => {
            const fechaSolicitud = permiso.fecha_solicitud ? new Date(permiso.fecha_solicitud) : null;
            if (fechaSolicitud) {
                const monthYear = `${fechaSolicitud.getMonth() + 1}/${fechaSolicitud.getFullYear()}`;

                if (countsByMonth[monthYear]) {
                    countsByMonth[monthYear]++;
                } else {
                    countsByMonth[monthYear] = 1;
                }
            }
        });

        const sortedLabels = Object.keys(countsByMonth).sort((a, b) => {
            const dateA = new Date(`${a.split('/')[1]}-${a.split('/')[0]}-01`);
            const dateB = new Date(`${b.split('/')[1]}-${b.split('/')[0]}-01`);
            return dateA - dateB;
        });

        const labels = sortedLabels.map(label => label.replace('/', ' - '));
        const data = sortedLabels.map(label => countsByMonth[label]);

        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Permisos',
                    data: data,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.4,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cantidad de Permisos por Mes',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Mes'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Cantidad'
                        }
                    }
                }
            }
        };

        // Crear gradiente para la línea del gráfico
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
        gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');
        config.data.datasets[0].backgroundColor = gradient;

        // Destruir gráfico anterior y crear nuevo gráfico
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }
        window.myChart = new Chart(ctx, config);
    };

    // Observar cambios en el tamaño del canvas para hacer el gráfico responsive
    const resizeObserver = new ResizeObserver(() => {
        updateChart();
    });
    if (canvas) {
        resizeObserver.observe(canvas);
    }

    // Agregar eventos a los campos de filtro si existen
    if (filterInput) {
        filterInput.addEventListener('input', updateTableAndChart);
    }
    if (startDateInput) {
        startDateInput.addEventListener('change', updateTableAndChart);
    }
    if (endDateInput) {
        endDateInput.addEventListener('change', updateTableAndChart);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos
    const permisos = JSON.parse(localStorage.getItem('permisos')) || [];
    const widgetsContainer = document.getElementById('widgets-container');

    // Obtener motivos únicos
    const motivos = [...new Set(permisos.map(p => p.motivo_permiso).filter(Boolean))];

    // Función para crear un widget
    const createWidget = (motivo) => {
        const count = permisos.filter(p => p.motivo_permiso === motivo).length;
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'widget';
        widgetDiv.innerHTML = `
            <h2>${motivo}</h2>
            <p>${count}</p>
        `;
        return widgetDiv;
    };

    // Generar widgets para cada motivo
    motivos.forEach(motivo => {
        const widget = createWidget(motivo);
        widgetsContainer.appendChild(widget);
    });
});


