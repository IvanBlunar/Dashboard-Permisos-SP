document.addEventListener('DOMContentLoaded', () => {
    // Obtener la URL actual
    const currentUrl = window.location.pathname;
    
    // Obtener todos los enlaces del menú
    const navLinks = document.querySelectorAll('nav a');

    // Recorrer todos los enlaces
    navLinks.forEach(link => {
        // Comparar la URL actual con el href del enlace
        if (currentUrl.endsWith(link.getAttribute('href'))) {
            // Agregar clase activa al enlace correspondiente
            link.classList.add('active');
        }
    });
});
