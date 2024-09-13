document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('permiso-form');
    const exportBtn = document.getElementById('export-btn');
    const descontableSelect = document.getElementById('descontable');
    const recuperadoInfo = document.getElementById('recuperado-info');

    // Manejar la visibilidad de los campos adicionales según la opción seleccionada
    descontableSelect.addEventListener('change', function () {
        recuperadoInfo.style.display = this.value === 'recuperado' ? 'block' : 'none';
    });

    // Función para comprobar si el formulario es válido
    function isFormValid() {
        return form.checkValidity();
    }

    // Función para resaltar campos inválidos
    function highlightInvalidFields() {
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        const existingMessages = form.querySelectorAll('.error-message');
        existingMessages.forEach(msg => msg.remove());

        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.checkValidity()) {
                field.classList.add('error');
                const errorMessage = document.createElement('div');
                errorMessage.classList.add('error-message');
                errorMessage.textContent = 'Este campo es obligatorio.';
                field.parentNode.appendChild(errorMessage);
            }
        });
    }

    // Manejar el evento click en el botón Exportar
    exportBtn.addEventListener('click', function () {
        if (isFormValid()) {
            generatePDF();
        } else {
            highlightInvalidFields();
            alert('Por favor, complete todos los campos obligatorios.');
        }
    });

    // Función para enviar el PDF al servidor
    async function sendPDFToServer(pdfBlob, filename) {
        const formData = new FormData();
        formData.append('file', pdfBlob, filename);

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al enviar el archivo');
            }

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
        } catch (error) {
            console.error('Error al cargar el archivo:', error);
        }
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoUrl = 'assets/img/logored.PNG';
        const logoWidth = 30;
        const logoHeight = 20;

        const permisoData = {
            fecha_solicitud: document.getElementById('fecha-solicitud').value,
            nombres_apellidos: document.getElementById('nombres-apellidos').value,
            cedula: document.getElementById('cedula').value,
            fecha_permiso: document.getElementById('fecha-permiso').value,
            hora_salida: document.getElementById('hora-salida').value || 'N/A',
            hora_llegada: document.getElementById('hora-llegada').value || 'N/A',
            motivo_permiso: Array.from(document.getElementById('motivo-permiso').selectedOptions).map(option => option.text).join(', '),
            descontable: document.getElementById('descontable').value === 'si' ? 'Sí' : document.getElementById('descontable').value === 'recuperado' ? 'Recuperado' : 'No',
            fecha_recuperacion: document.getElementById('fecha-recuperacion').value || 'N/A',
            hora_recuperacion: document.getElementById('hora-recuperacion').value || 'N/A',
            autorizado_por: document.getElementById('autorizado-por').value,
            observaciones: document.getElementById('observaciones').value || 'N/A',
            firma: null // Inicializar como null
        };

        const permisos = JSON.parse(localStorage.getItem('permisos')) || [];
        permisos.push(permisoData);
        localStorage.setItem('permisos', JSON.stringify(permisos));

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

        const img = new Image();
        img.src = logoUrl;
        img.onload = async function () {
            doc.addImage(img, 'PNG', pageWidth - logoWidth - 10, 14, logoWidth, logoHeight);

            doc.setFontSize(fontSizeTitle);
            doc.setTextColor(fontColorTitle);
            doc.text('Formulario de Permiso', startX, yPosition);
            yPosition += lineHeight * 2;

            const addText = (label, value) => {
                doc.setFontSize(fontSizeText);
                doc.setTextColor(fontColorText);
                doc.setFont('helvetica', 'bold');
                doc.text(label, startX, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(value, valueColumnX, yPosition);
                yPosition += lineHeight;
            };

            addText('Fecha de Solicitud:', permisoData.fecha_solicitud);
            addText('Nombres y Apellidos:', permisoData.nombres_apellidos);
            addText('Cédula:', permisoData.cedula);
            addText('Fecha del Permiso:', permisoData.fecha_permiso);
            addText('Hora de Salida:', permisoData.hora_salida);
            addText('Hora de Llegada:', permisoData.hora_llegada);
            addText('Motivo del Permiso:', permisoData.motivo_permiso);
            addText('Descontable:', permisoData.descontable);

            if (permisoData.descontable === 'Recuperado') {
                addText('Fecha de Recuperación:', permisoData.fecha_recuperacion);
                addText('Horario de Recuperación:', permisoData.hora_recuperacion);
            }

            addText('Observaciones:', permisoData.observaciones);

            const firmaInput = document.getElementById('firma');
            if (firmaInput.files.length > 0) {
                const file = firmaInput.files[0];
                const reader = new FileReader();
                reader.onload = async function (e) {
                    const imgData = e.target.result;
                    permisoData.firma = imgData; // Guardar firma como Data URL

                    doc.addImage(imgData, 'PNG', startX, yPosition, 50, 20);
                    yPosition += 30;

                    doc.setFontSize(fontSizeText);
                    doc.setTextColor(fontColorText);
                    doc.setFont('helvetica', 'normal');
                    doc.text('FIRMA DEL TRABAJADOR', startX, yPosition);
                    yPosition += lineHeight;

                    const autorizadoPorYPosition = yPosition - 10;
                    doc.setFontSize(fontSizeText);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(fontColorText);
                    const autorizadoPorValue = permisoData.autorizado_por;
                    const textHeight = fontSizeText * 1.2;
                    doc.text(autorizadoPorValue, valueColumnX, autorizadoPorYPosition - textHeight);
                    doc.text('AUTORIZADO POR:', valueColumnX, autorizadoPorYPosition);
                    yPosition = autorizadoPorYPosition + lineHeight;

                    drawBorder();
                    const pdfBlob = doc.output('blob');
                    const filename = `${permisoData.cedula}_${permisoData.fecha_solicitud.replace(/-/g, '-')}.pdf`;
                    await sendPDFToServer(pdfBlob, filename);
                    localStorage.setItem('permisos', JSON.stringify(permisos)); // Guardar permisos con la firma
                    doc.save(filename);
                };
                reader.readAsDataURL(file);
            } else {
                yPosition += lineHeight;
                const autorizadoPorYPosition = yPosition - 10;
                doc.setFontSize(fontSizeText);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(fontColorText);
                const autorizadoPorValue = permisoData.autorizado_por;
                const textHeight = fontSizeText * 1.2;
                doc.text(autorizadoPorValue, valueColumnX, autorizadoPorYPosition - textHeight);
                doc.text('AUTORIZADO POR:', valueColumnX, autorizadoPorYPosition);
                yPosition = autorizadoPorYPosition + lineHeight;

                drawBorder();
                const pdfBlob = doc.output('blob');
                const filename = `${permisoData.cedula}_${permisoData.fecha_solicitud.replace(/-/g, '-')}.pdf`;
                await sendPDFToServer(pdfBlob, filename);
                localStorage.setItem('permisos', JSON.stringify(permisos)); // Guardar permisos
                doc.save(filename);
            }
        };
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    // Inicialmente oculta los enlaces
    sidebar.classList.add('hide-links');

    menuToggle.addEventListener('click', function () {
        // Alterna la clase `hide-links` en la barra lateral
        sidebar.classList.toggle('hide-links');
    });
});



// Obtener el token del localStorage (simulado)
const token = localStorage.getItem('token');

// Función para ajustar la visibilidad del menú según el rol del usuario
function ajustarVisibilidadMenu() {
    const elementosMenu = document.querySelectorAll('#menuNav a');
    const logoutButton = document.getElementById('logoutButton');
    const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : ''; // Decodificar y obtener el rol del token

    elementosMenu.forEach(elemento => {
        if (userRole === 'admin' || elemento.id === 'navPermisos') {
            elemento.style.display = 'block'; // Mostrar elementos permitidos
        } else {
            elemento.style.display = 'none'; // Ocultar elementos no permitidos
        }
    });

    // Mostrar u ocultar el botón de Cerrar Sesión según el rol
    if (userRole === 'admin') {
        logoutButton.style.display = 'block'; // Mostrar el botón de Cerrar Sesión
    } else {
        logoutButton.style.display = 'none'; // Ocultar el botón de Cerrar Sesión
    }
}

// Llamar a la función al cargar la página para ajustar la visibilidad inicial del menú
ajustarVisibilidadMenu();

