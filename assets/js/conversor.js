document.addEventListener('DOMContentLoaded', async () => {
    const btnCalcular = document.getElementById('btnCalcularDolar');
    const resultBox = document.getElementById('resultadoDolar');
    const direccionConversion = document.getElementById('direccionConversion');
    const labelMonto = document.getElementById('labelMonto');
    const iconMonto = document.getElementById('iconMonto');
    const inputMonto = document.getElementById('montoCambio');

    // Objeto vacío que llenaremos con la API
    let COTIZACIONES = {};

    // 1. Bloqueamos el botón y mostramos estado de carga
    if (btnCalcular) {
        btnCalcular.disabled = true;
        btnCalcular.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando tasas reales...';
        btnCalcular.style.opacity = '0.7';
    }

    // 2. Fetch a DolarAPI
    try {
        const response = await fetch('https://dolarapi.com/v1/dolares');
        const data = await response.json();

        // Mapeamos los resultados de la API a nuestro objeto
        data.forEach(dolar => {
            if (dolar.casa === 'oficial') COTIZACIONES.oficial = dolar.venta;
            if (dolar.casa === 'blue') COTIZACIONES.blue = dolar.venta;
            if (dolar.casa === 'bolsa') COTIZACIONES.mep = dolar.venta; 
            if (dolar.casa === 'contadoconliqui') COTIZACIONES.ccl = dolar.venta;
            if (dolar.casa === 'tarjeta') COTIZACIONES.tarjeta = dolar.venta;
        });

        // Rehabilitamos el botón
        if (btnCalcular) {
            btnCalcular.disabled = false;
            btnCalcular.innerHTML = '<i class="fa-solid fa-money-bill-transfer"></i> Convertir Divisa';
            btnCalcular.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
        alert('Hubo un error de red conectando al servidor del BCRA. Se usarán tasas de respaldo.');
        
        // Fallback de emergencia por si se cae el internet
        COTIZACIONES = { blue: 1450, mep: 1410, ccl: 1435, tarjeta: 1460, oficial: 925 };
        
        if (btnCalcular) {
            btnCalcular.disabled = false;
            btnCalcular.innerHTML = '<i class="fa-solid fa-money-bill-transfer"></i> Convertir Divisa (Respaldo)';
            btnCalcular.style.opacity = '1';
        }
    }

    // 3. CAMBIO DINÁMICO DE INTERFAZ (Pesos o Dólares)
    if (direccionConversion && labelMonto && iconMonto) {
        direccionConversion.addEventListener('change', function() {
            if (this.value === 'ars_to_usd') {
                labelMonto.textContent = 'Monto en Pesos';
                iconMonto.textContent = '$';
            } else {
                labelMonto.textContent = 'Monto en Dólares';
                iconMonto.textContent = 'U$S';
            }
            if (resultBox) resultBox.classList.add('d-none');
        });
    }

    // 4. MÁSCARA EN TIEMPO REAL
    if (inputMonto) {
        inputMonto.addEventListener('input', function() {
            if (direccionConversion.value === 'ars_to_usd') {
                let valor = this.value.replace(/\D/g, '');
                if (valor !== '') {
                    valor = parseInt(valor, 10).toLocaleString('es-AR');
                }
                this.value = valor;
            }
        });
    }

    // 5. MATEMÁTICA DE CONVERSIÓN
    if (btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            const operacion = direccionConversion.value;
            const tipoDolar = document.getElementById('tipoDolar').value;
            const montoRaw = inputMonto.value;

            const montoLimpio = operacion === 'ars_to_usd' ? montoRaw.replace(/\./g, '') : montoRaw;
            const monto = parseFloat(montoLimpio);
            const tasa = COTIZACIONES[tipoDolar];

            if (isNaN(monto) || monto <= 0) {
                alert('Por favor, ingresá un monto válido mayor a 0.');
                return;
            }

            let totalConvertido = 0;
            let displayMontoIngresado = '';
            let displayTotalConvertido = '';

            if (operacion === 'ars_to_usd') {
                totalConvertido = monto / tasa;
                displayMontoIngresado = `$ ${monto.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
                displayTotalConvertido = `U$S ${totalConvertido.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            } else {
                totalConvertido = monto * tasa;
                displayMontoIngresado = `U$S ${monto.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
                displayTotalConvertido = `$ ${totalConvertido.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }

            document.getElementById('resMontoIngresado').textContent = displayMontoIngresado;
            document.getElementById('resCotizacionAplicada').textContent = `$ ${tasa.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
            document.getElementById('resTotalConvertido').textContent = displayTotalConvertido;

            resultBox.classList.remove('d-none');

            setTimeout(() => {
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        });
    }
});

function compartirWhatsAppDolar() {
    const operacion = document.getElementById('direccionConversion').value;
    const montoIngresado = document.getElementById('resMontoIngresado').textContent;
    const cotizacion = document.getElementById('resCotizacionAplicada').textContent;
    const total = document.getElementById('resTotalConvertido').textContent;
    const tipo = document.getElementById('tipoDolar').options[document.getElementById('tipoDolar').selectedIndex].text;

    let mensaje = `📊 *Consulta de Divisas - Mis Finanzas*\n\n`;
    if (operacion === 'ars_to_usd') {
        mensaje += `💵 Cambiando: ${montoIngresado} ARS\n`;
        mensaje += `📈 Cotización (${tipo}): ${cotizacion}\n\n`;
        mensaje += `👉 *Recibís: ${total}*`;
    } else {
        mensaje += `💵 Cambiando: ${montoIngresado} USD\n`;
        mensaje += `📈 Cotización (${tipo}): ${cotizacion}\n\n`;
        mensaje += `👉 *Recibís: ${total}*`;
    }

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}