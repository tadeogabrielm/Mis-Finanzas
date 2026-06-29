document.addEventListener('DOMContentLoaded', () => {
    const btnCalcularPromo = document.getElementById('btnCalcularPromo');
    const resultBox = document.getElementById('resultadoPromo');
    const alertaTope = document.getElementById('alertaTope');

    // 1. Formateo visual de miles en tiempo real para inputs de dinero
    document.querySelectorAll('.form-control-monto').forEach(input => {
        input.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor !== '') {
                valor = parseInt(valor, 10).toLocaleString('es-AR');
            }
            this.value = valor;
        });
    });

    if (btnCalcularPromo) {
        btnCalcularPromo.addEventListener('click', () => {
            const precioInput = document.getElementById('precioOriginal').value;
            const porcentajeInput = document.getElementById('porcentajeDescuento').value;
            const topeInput = document.getElementById('topeReintegro').value;

            // Limpieza de datos
            const precio = parseFloat(precioInput.replace(/\./g, '')) || 0;
            const porcentaje = parseFloat(porcentajeInput) || 0;
            const tope = parseFloat(topeInput.replace(/\./g, '')) || Infinity; // Si está vacío, el tope es infinito

            // Validación
            if (precio <= 0) {
                alert('Por favor, ingresá un precio válido mayor a 0.');
                return;
            }
            if (porcentaje <= 0 || porcentaje > 100) {
                alert('El descuento tiene que ser un porcentaje entre 1 y 100.');
                return;
            }

            // 2. Lógica Matemática del Tope
            let descuentoTeorico = precio * (porcentaje / 100);
            let descuentoReal = descuentoTeorico;
            let tocoTope = false;

            // Verificamos si el descuento supera el tope impuesto por el banco/app
            if (descuentoTeorico > tope) {
                descuentoReal = tope;
                tocoTope = true;
            }

            const precioFinal = precio - descuentoReal;

            // 3. Renderizado Visual
            document.getElementById('resPrecioOriginal').textContent = `$${precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resPlataDevuelta').textContent = `-$${descuentoReal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resPrecioFinal').textContent = `$${precioFinal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            // Mostramos u ocultamos la alerta naranja si chocó con el tope
            alertaTope.style.display = tocoTope ? 'block' : 'none';

            resultBox.style.display = 'block';

            // Auto-scroll
            setTimeout(() => {
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        });
    }
});

// Función dinámica para WhatsApp
function compartirWhatsAppPromo() {
    const detalle = document.getElementById('detallePromo').value || 'esta promo';
    const precioOriginal = document.getElementById('resPrecioOriginal').textContent;
    const precioFinal = document.getElementById('resPrecioFinal').textContent;
    const porcentaje = document.getElementById('porcentajeDescuento').value;

    const mensaje = `¡Ojo con ${detalle}! 👀\n\n` +
                    `🏷️ Precio de lista: ${precioOriginal}\n` +
                    `💸 Te hacen un ${porcentaje}% de descuento.\n\n` +
                    `👉 *Te queda en ${precioFinal} final.*\n\n` +
                    `¿Sirve o es verso?`;

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}