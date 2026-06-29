document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    // Seleccionamos directamente los contenedores de las columnas de Bootstrap
    const articles = document.querySelectorAll('main.main-content article');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            articles.forEach(article => {
                // Buscamos el texto dentro de la tarjeta (título y descripción)
                const text = article.textContent.toLowerCase();
                
                if (text.includes(searchTerm)) {
                    // Si coincide, mostramos toda la columna de Bootstrap
                    article.style.display = ''; 
                } else {
                    // Si no coincide, ocultamos el contenedor entero para que el resto se deslice hacia la izquierda
                    article.style.display = 'none'; 
                }
            });
        });
    }
});