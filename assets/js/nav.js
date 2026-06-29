// =========================================
    // LÓGICA DEL NAV ABANICO MOBILE
    // =========================================
    const fabToggle = document.getElementById('fabToggle');
    const fabContainer = document.getElementById('fabContainer');

    if (fabToggle && fabContainer) {
        fabToggle.addEventListener('click', () => {
            // Alterna la clase 'open' en el contenedor principal
            fabContainer.classList.toggle('open');
            
            // Cambiamos el icono entre hamburguesa y el signo '+' (que rotado en CSS parece una X)
            const icon = fabToggle.querySelector('i');
            if (fabContainer.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-plus'); 
            } else {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-bars');
            }
        });
    }