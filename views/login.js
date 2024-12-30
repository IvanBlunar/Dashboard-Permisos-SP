document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene el envío por defecto del formulario

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Cambia el Content-Type a application/json
        },
        body: JSON.stringify({ username, password }) // Envía los datos como JSON
    })
    .then(response => response.json()) // Usa .json() para manejar la respuesta JSON
    .then(result => {
        if (result.token) {
            // Almacena el token en el almacenamiento local
            localStorage.setItem('token', result.token);
            // Redirige a la página de inicio
            window.location.href = '/inicio/inicio.html';
        } else {
            alert(result.message); // Muestra un mensaje de error desde el servidor
        }
    })
    .catch(error => console.error('Error:', error));
});
