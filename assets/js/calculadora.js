document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btnCalcular');
    const resultBox = document.getElementById('resultadoCalculadora');
    const inputPrecio = document.getElementById('precioTotal');

    // 1. FORMATEO EN TIEMPO REAL: Separador de miles al escribir
    inputPrecio.addEventListener('input', function(e) {
        // Borramos cualquier cosa que no sea un número (letras, símbolos)
        let valor = this.value.replace(/\D/g, '');
        
        // Si hay un número, le aplicamos el formato de miles (Ej: 1000000 -> 1.000.000)
        if (valor !== '') {
            valor = parseInt(valor, 10).toLocaleString('es-AR');
        }
        
        this.value = valor;
    });

    btnCalcular.addEventListener('click', () => {
        const precioInput = document.getElementById('precioTotal').value;
        const cuotasInput = document.getElementById('cantidadCuotas').value;
        const tasaInput = document.getElementById('tasaInteres').value;

        // 2. LIMPIEZA DE DATOS: Le sacamos los puntos para que JS pueda sumar y multiplicar
        const precioLimpio = precioInput.replace(/\./g, '');
        const precio = parseFloat(precioLimpio);
        
        const cuotas = parseInt(cuotasInput);
        
        let tasa = parseFloat(tasaInput);
        if (isNaN(tasa) || tasa < 0) {
            tasa = 0;
        }

        if (isNaN(precio) || precio <= 0) {
            alert('Por favor, ingresá un precio válido mayor a 0.');
            return;
        }

        // Matemática
        const interesPlata = precio * (tasa / 100);
        const totalFinal = precio + interesPlata;
        const valorCuota = totalFinal / cuotas;

        // Inyección de resultados
        document.getElementById('resCuota').textContent = `$${valorCuota.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('resTotal').textContent = `$${totalFinal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('resInteres').textContent = `$${interesPlata.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        resultBox.style.display = 'block';

        // 3. AUTO-SCROLL: Desliza la pantalla suavemente hacia la caja de resultados
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50); // Un pequeño retraso para asegurar que el display: block ya impactó en pantalla
    });
});

function compartirWhatsApp() {
    const cuotas = document.getElementById('cantidadCuotas').value;
    const resCuota = document.getElementById('resCuota').textContent;
    const resTotal = document.getElementById('resTotal').textContent;
    const precioInicial = document.getElementById('precioTotal').value;

    const mensaje = `¡Hola! Acabo de simular una compra de $${precioInicial} en *Mis Finanzas* 📊\n\n` +
                    `💳 Me quedan *${cuotas} cuotas de ${resCuota}*.\n` +
                    `💰 Total a pagar: ${resTotal}.\n\n` +
                    `¿Qué te parece, conviene?`;

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}