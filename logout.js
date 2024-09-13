document.getElementById('logoutButton').addEventListener('click', function() {
    // Eliminar el token del almacenamiento local
    localStorage.removeItem('token');
    // Redirigir a la página de inicio de sesión
    window.location.href = 'http://127.0.0.1:5500/views/login.html';
});
