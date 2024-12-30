document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene el envío por defecto del formulario

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.text())
    .then(result => {
        alert(result);
    })
    .catch(error => console.error('Error:', error));
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
