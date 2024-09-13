document.addEventListener('DOMContentLoaded', function() {
    const permisosListContainer = document.getElementById('permisos-list');
    const paginationContainer = document.getElementById('pagination');
    const itemsPerPage = 15;
    const maxVisiblePages = 10; // Número máximo de botones de página a mostrar

    let currentPage = 1;
    const permisos = JSON.parse(localStorage.getItem('permisos')) || [];

    function renderPage(page) {
        permisosListContainer.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, permisos.length);

        for (let i = start; i < end; i++) {
            const permiso = permisos[i];
            const permisoItem = document.createElement('div');
            permisoItem.classList.add('permiso-item');
            permisoItem.innerHTML = `<a href="#" data-index="${i}">${permiso.nombres_apellidos} - ${permiso.fecha_permiso}</a>`;
            permisosListContainer.appendChild(permisoItem);

            permisoItem.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                showPermisoDetails(i);
            });
        }

        renderPagination(page);
    }

    function renderPagination(currentPage) {
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(permisos.length / itemsPerPage);

        // Botón "Anterior"
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.addEventListener('click', function() {
                renderPage(currentPage - 1);
            });
            paginationContainer.appendChild(prevButton);
        }

        // Rango de páginas visibles
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Ajustar el rango si es necesario
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.className = i === currentPage ? 'active' : ''; // Añade clase activa para el botón actual
            pageButton.addEventListener('click', function() {
                renderPage(i);
            });
            paginationContainer.appendChild(pageButton);
        }

        // Botón "Siguiente"
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Siguiente';
            nextButton.addEventListener('click', function() {
                renderPage(currentPage + 1);
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    function showPermisoDetails(index) {
        const permiso = permisos[index];
        let detailsHTML = `
            <p><strong>Fecha de Solicitud:</strong> ${permiso.fecha_solicitud || 'N/A'}</p>
            <p><strong>Nombres y Apellidos:</strong> ${permiso.nombres_apellidos || 'N/A'}</p>
            <p><strong>Cédula:</strong> ${permiso.cedula || 'N/A'}</p>
            <p><strong>Fecha del Permiso:</strong> ${permiso.fecha_permiso || 'N/A'}</p>
            <p><strong>Hora de Salida:</strong> ${permiso.hora_salida || 'N/A'}</p>
            <p><strong>Hora de Llegada:</strong> ${permiso.hora_llegada || 'N/A'}</p>
            <p><strong>Motivo del Permiso:</strong> ${permiso.motivo_permiso || 'N/A'}</p>
            <p><strong>Descontable:</strong> ${permiso.descontable || 'N/A'}</p>
        `;
        if (permiso.descontable === 'Recuperado') {
            detailsHTML += `
                <p><strong>Fecha de Recuperación:</strong> ${permiso.fecha_recuperacion || 'N/A'}</p>
                <p><strong>Horario de Recuperación:</strong> ${permiso.hora_recuperacion || 'N/A'}</p>
            `;
        }
        detailsHTML += `
            <p><strong>Autorizado por:</strong> ${permiso.autorizado_por || 'N/A'}</p>
            <p><strong>Observaciones:</strong> ${permiso.observaciones || 'N/A'}</p>
        `;

        if (permiso.firma) {
            detailsHTML += `
                <p><strong>Firma:</strong></p>
                <img src="${permiso.firma}" alt="Firma del Trabajador" style="max-width: 200px; max-height: 100px;">
            `;
        } else {
            detailsHTML += `
                <p><strong>Firma:</strong> No disponible</p>
            `;
        }
        
        detailsHTML += `<a href="#" onclick="downloadPDF(${index})">Descargar PDF</a>`;
        const permisoInfoContainer = document.querySelector('.main-content');
        permisoInfoContainer.innerHTML = detailsHTML;
    }

    window.downloadPDF = function(index) {
        const permiso = permisos[index];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoUrl = '../assets/img/logored.PNG'; 
        const logoWidth = 30;
        const logoHeight = 20;

        const fontSizeTitle = 16;
        const fontSizeText = 12;
        const fontColorTitle = '#003366';
        const fontColorText = '#000000';
        const lineHeight = 10;
        const labelColumnWidth = 80;
        const valueColumnWidth = 100;
        const gap = 20;
        let yPosition = 30;
        const startX = 10;
        const valueColumnX = startX + labelColumnWidth + gap;
        const pageWidth = doc.internal.pageSize.width;

        const drawBorder = () => {
            doc.setDrawColor(0);
            doc.rect(startX - 5, 15, pageWidth - 2 * (startX - 5), yPosition + 50 - 15);
        };

        const logoImg = new Image();
        logoImg.src = logoUrl;
        logoImg.onload = function() {
            doc.addImage(logoImg, 'PNG', pageWidth - logoWidth - 10, 14, logoWidth, logoHeight);

            doc.setFontSize(fontSizeTitle);
            doc.setTextColor(fontColorTitle);
            doc.text('Formulario de Permiso', startX, yPosition);
            yPosition += lineHeight * 2;

            const addText = (label, value) => {
                if (typeof value !== 'string') value = String(value);
                doc.setFontSize(fontSizeText);
                doc.setTextColor(fontColorText);
                doc.setFont('helvetica', 'bold');
                doc.text(label, startX, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(value, valueColumnX, yPosition);
                yPosition += lineHeight;
            };

            addText('Fecha de Solicitud:', permiso.fecha_solicitud || 'N/A');
            addText('Nombres y Apellidos:', permiso.nombres_apellidos || 'N/A');
            addText('Cédula:', permiso.cedula || 'N/A');
            addText('Fecha para la cual se requiere el permiso:', permiso.fecha_permiso || 'N/A');
            addText('Hora de Salida:', permiso.hora_salida || 'N/A');
            addText('Hora de Llegada:', permiso.hora_llegada || 'N/A');
            addText('Motivo del Permiso:', permiso.motivo_permiso || 'N/A');
            addText('Descontable:', permiso.descontable || 'N/A');
            
            if (permiso.descontable === 'Recuperado') {
                addText('Fecha de Recuperación:', permiso.fecha_recuperacion || 'N/A');
                addText('Horario de Recuperación:', permiso.hora_recuperacion || 'N/A');
            }

            addText('Observaciones:', permiso.observaciones || 'N/A');
            addText('AUTORIZADO POR:', permiso.autorizado_por || 'N/A');

            if (permiso.firma) {
                const firmaImg = new Image();
                firmaImg.src = permiso.firma;
                firmaImg.onload = function() {
                    doc.addImage(firmaImg, 'PNG', startX, yPosition + 10, 50, 20);
                    yPosition += 30;

                    doc.setFontSize(fontSizeText);
                    doc.setTextColor(fontColorText);
                    doc.setFont('helvetica', 'normal');
                    doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                    yPosition += lineHeight;

                    drawBorder();
                    const filename = `${permiso.cedula}_${permiso.fecha_solicitud.replace(/-/g, '')}.pdf`;
                    doc.save(filename);
                };
                firmaImg.onerror = function() {
                    console.log('Error cargando la imagen de la firma.');
                    doc.setFontSize(fontSizeText);
                    doc.setTextColor(fontColorText);
                    doc.setFont('helvetica', 'normal');
                    doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                    yPosition += lineHeight;

                    drawBorder();
                    const filename = `${permiso.cedula}_${permiso.fecha_solicitud.replace(/-/g, '')}.pdf`;
                    doc.save(filename);
                };
            } else {
                doc.setFontSize(fontSizeText);
                doc.setTextColor(fontColorText);
                doc.setFont('helvetica', 'normal');
                doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                yPosition += lineHeight;

                drawBorder();
                const filename = `${permiso.cedula}_${permiso.fecha_solicitud.replace(/-/g, '')}.pdf`;
                doc.save(filename);
            }
        };
    };

    // Inicializa la primera página
    renderPage(currentPage);
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


document.addEventListener('DOMContentLoaded', function() {
    const permisosListContainer = document.getElementById('permisos-list');
    const paginationContainer = document.getElementById('pagination');
    const filterInput = document.getElementById('filter-input');
    const itemsPerPage = 15;
    const maxVisiblePages = 10; // Número máximo de botones de página a mostrar

    let currentPage = 1;
    let permisos = JSON.parse(localStorage.getItem('permisos')) || [];
    let filteredPermisos = permisos;

    function renderPage(page) {
        permisosListContainer.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredPermisos.length);

        for (let i = start; i < end; i++) {
            const permiso = filteredPermisos[i];
            const permisoItem = document.createElement('div');
            permisoItem.classList.add('permiso-item');
            permisoItem.innerHTML = `<a href="#" data-index="${i}">${permiso.nombres_apellidos} - ${permiso.fecha_permiso}</a>`;
            permisosListContainer.appendChild(permisoItem);

            permisoItem.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                showPermisoDetails(i);
            });
        }

        renderPagination(page);
    }

    function renderPagination(currentPage) {
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(filteredPermisos.length / itemsPerPage);

        // Botón "Anterior"
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.addEventListener('click', function() {
                renderPage(currentPage - 1);
            });
            paginationContainer.appendChild(prevButton);
        }

        // Rango de páginas visibles
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Ajustar el rango si es necesario
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.className = i === currentPage ? 'active' : ''; // Añade clase activa para el botón actual
            pageButton.addEventListener('click', function() {
                renderPage(i);
            });
            paginationContainer.appendChild(pageButton);
        }

        // Botón "Siguiente"
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Siguiente';
            nextButton.addEventListener('click', function() {
                renderPage(currentPage + 1);
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    function showPermisoDetails(index) {
        const permiso = filteredPermisos[index];
        let detailsHTML = `
            <p><strong>Fecha de Solicitud:</strong> ${permiso.fecha_solicitud || 'N/A'}</p>
            <p><strong>Nombres y Apellidos:</strong> ${permiso.nombres_apellidos || 'N/A'}</p>
            <p><strong>Cédula:</strong> ${permiso.cedula || 'N/A'}</p>
            <p><strong>Fecha del Permiso:</strong> ${permiso.fecha_permiso || 'N/A'}</p>
            <p><strong>Hora de Salida:</strong> ${permiso.hora_salida || 'N/A'}</p>
            <p><strong>Hora de Llegada:</strong> ${permiso.hora_llegada || 'N/A'}</p>
            <p><strong>Motivo del Permiso:</strong> ${permiso.motivo_permiso || 'N/A'}</p>
            <p><strong>Descontable:</strong> ${permiso.descontable || 'N/A'}</p>
        `;
        if (permiso.descontable === 'Recuperado') {
            detailsHTML += `
                <p><strong>Fecha de Recuperación:</strong> ${permiso.fecha_recuperacion || 'N/A'}</p>
                <p><strong>Horario de Recuperación:</strong> ${permiso.hora_recuperacion || 'N/A'}</p>
            `;
        }
        detailsHTML += `
            <p><strong>Autorizado por:</strong> ${permiso.autorizado_por || 'N/A'}</p>
            <p><strong>Observaciones:</strong> ${permiso.observaciones || 'N/A'}</p>
        `;

        if (permiso.firma) {
            detailsHTML += `
                <p><strong>Firma:</strong></p>
                <img src="${permiso.firma}" alt="Firma del Trabajador" style="max-width: 200px; max-height: 100px;">
            `;
        } else {
            detailsHTML += `
                <p><strong>Firma:</strong> No disponible</p>
            `;
        }
        
        detailsHTML += `<a href="#" onclick="downloadPDF(${index})">Descargar PDF</a>`;
        const permisoInfoContainer = document.querySelector('.main-content');
        permisoInfoContainer.innerHTML = detailsHTML;
    }

    window.downloadPDF = function(index) {
        const permiso = filteredPermisos[index];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoUrl = '../assets/img/logored.PNG'; 
        const logoWidth = 30;
        const logoHeight = 20;

        const fontSizeTitle = 16;
        const fontSizeText = 12;
        const fontColorTitle = '#003366';
        const fontColorText = '#000000';
        const lineHeight = 10;
        const labelColumnWidth = 80;
        const valueColumnWidth = 100;
        const gap = 20;
        let yPosition = 30;
        const startX = 10;
        const valueColumnX = startX + labelColumnWidth + gap;
        const pageWidth = doc.internal.pageSize.width;

        const drawBorder = () => {
            doc.setDrawColor(0);
            doc.rect(startX - 5, 15, pageWidth - 2 * (startX - 5), yPosition + 50 - 15);
        };

        const logoImg = new Image();
        logoImg.src = logoUrl;
        logoImg.onload = function() {
            doc.addImage(logoImg, 'PNG', pageWidth - logoWidth - 10, 14, logoWidth, logoHeight);

            doc.setFontSize(fontSizeTitle);
            doc.setTextColor(fontColorTitle);
            doc.text('Formulario de Permiso', startX, yPosition);
            yPosition += lineHeight * 2;

            const addText = (label, value) => {
                if (typeof value !== 'string') value = String(value);
                doc.setFontSize(fontSizeText);
                doc.setTextColor(fontColorText);
                doc.setFont('helvetica', 'bold');
                doc.text(label, startX, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(value, valueColumnX, yPosition);
                yPosition += lineHeight;
            };

            addText('Fecha de Solicitud:', permiso.fecha_solicitud || 'N/A');
            addText('Nombres y Apellidos:', permiso.nombres_apellidos || 'N/A');
            addText('Cédula:', permiso.cedula || 'N/A');
            addText('Fecha para la cual se requiere el permiso:', permiso.fecha_permiso || 'N/A');
            addText('Hora de Salida:', permiso.hora_salida || 'N/A');
            addText('Hora de Llegada:', permiso.hora_llegada || 'N/A');
            addText('Motivo del Permiso:', permiso.motivo_permiso || 'N/A');
            addText('Descontable:', permiso.descontable || 'N/A');
            
            if (permiso.descontable === 'Recuperado') {
                addText('Fecha de Recuperación:', permiso.fecha_recuperacion || 'N/A');
                addText('Horario de Recuperación:', permiso.hora_recuperacion || 'N/A');
            }

            addText('Observaciones:', permiso.observaciones || 'N/A');
            addText('AUTORIZADO POR:', permiso.autorizado_por || 'N/A');

            if (permiso.firma) {
                const firmaImg = new Image();
                firmaImg.src = permiso.firma;
                firmaImg.onload = function() {
                    doc.addImage(firmaImg, 'PNG', startX, yPosition + 10, 50, 20);
                    yPosition += 30;

                    doc.setFontSize(fontSizeText);
                    doc.setTextColor(fontColorText);
                    doc.setFont('helvetica', 'normal');
                    doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                    yPosition += lineHeight;

                    drawBorder();
                    const filename = `${permiso.cedula}_${permiso.fecha_solicitud.replace(/-/g, '')}.pdf`;
                    doc.save(filename);
                };
                firmaImg.onerror = function() {
                    console.log('Error cargando la imagen de la firma.');
                    doc.setFontSize(fontSizeText);
                    doc.setTextColor(fontColorText);
                    doc.setFont('helvetica', 'normal');
                    doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                    yPosition += lineHeight;

                    drawBorder();
                    const filename = `${permiso.cedula}_${permiso.fecha_solicitud.replace(/-/g, '')}.pdf`;
                    doc.save(filename);
                };
            } else {
                doc.setFontSize(fontSizeText);
                doc.setTextColor(fontColorText);
                doc.setFont('helvetica', 'normal');
                doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                yPosition += lineHeight;

                drawBorder();
                const filename = `${permiso.cedula}_${permiso.fecha_solicitud.replace(/-/g, '')}.pdf`;
                doc.save(filename);
            }
        };
    };

    function filterPermisos() {
        const query = filterInput.value.toLowerCase();
        filteredPermisos = permisos.filter(permiso => 
            permiso.nombres_apellidos.toLowerCase().includes(query) ||
            permiso.cedula.toLowerCase().includes(query) ||
            permiso.fecha_permiso.toLowerCase().includes(query)
        );
        renderPage(1); // Renderiza la primera página después de filtrar
    }

    filterInput.addEventListener('input', filterPermisos);

    // Inicializa la primera página
    renderPage(currentPage);
});

