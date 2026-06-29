document.addEventListener('DOMContentLoaded', async () => {
    // 1. Seleccionamos los elementos del DOM a actualizar
    const widgetsSidebar = document.querySelectorAll('.dolar-widget');
    
    // Mapeo de selectores del Ticker (Index) contra los nombres de la API
    const selectoresTicker = {
        'oficial': '.val-oficial',
        'blue': '.val-blue',
        'bolsa': '.val-mep',            // DolarAPI llama 'bolsa' al dólar MEP
        'contadoconliqui': '.val-ccl',  // DolarAPI llama 'contadoconliqui' al CCL
        'tarjeta': '.val-tarjeta'
    };

    try {
        // 2. Hacemos el request a DolarAPI
        const response = await fetch('https://dolarapi.com/v1/dolares');
        const data = await response.json();

        // 3. Actualizamos el Sidebar (Dólar Blue) en todas las páginas
        const dolarBlue = data.find(d => d.casa === 'blue');
        if (dolarBlue) {
            widgetsSidebar.forEach(widget => {
                widget.textContent = `Dólar Blue: $${dolarBlue.venta.toFixed(2)}`;
            });
        }

        // 4. Actualizamos el Ticker en el index.html
        data.forEach(dolar => {
            const claseSelector = selectoresTicker[dolar.casa];
            if (claseSelector) {
                document.querySelectorAll(claseSelector).forEach(elemento => {
                    elemento.textContent = `$${dolar.venta.toFixed(2)}`;
                });
            }
        });

    } catch (error) {
        console.error('Error al conectar con DolarAPI:', error);
        
        // Feedback visual si no hay internet o falla la API
        widgetsSidebar.forEach(widget => {
            widget.textContent = 'Dólar Blue: Sin conexión';
        });
        document.querySelectorAll('.ticker-item span').forEach(elemento => {
            if(elemento.textContent === 'Cargando...') elemento.textContent = '---';
        });
    }
});