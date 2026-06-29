document.addEventListener('DOMContentLoaded', () => {
    const formSuscripcion = document.getElementById('formSuscripcion');
    const listaContenedor = document.getElementById('listaSuscripciones');
    const totalUsdDisplay = document.getElementById('totalUsdDisplay');
    const totalArsDisplay = document.getElementById('totalArsDisplay');
    const monedaSub = document.getElementById('monedaSub');
    const montoIcon = document.getElementById('montoIcon');

    // Referencia aproximada de Dólar Tarjeta para la conversión de servicios extranjeros
    const VALOR_DOLAR_TARJETA = 1450.50; 

    let suscripciones = [];

    // CAMBIO DE UX: Modifica el ícono de la moneda dinámicamente al seleccionar pesos o dólares
    if (monedaSub && montoIcon) {
        monedaSub.addEventListener('change', function() {
            montoIcon.textContent = this.value === 'USD' ? 'U$S' : '$';
        });
    }

    function actualizarUI() {
        listaContenedor.innerHTML = '';
        let totalMensualUsd = 0;
        let totalMensualArs = 0;

        if (suscripciones.length === 0) {
            listaContenedor.innerHTML = `
                <div class="text-center py-4" style="color: var(--text-muted); font-size: 14px; border: 1px dashed var(--border-light); border-radius: 12px; background: var(--surface-white);">
                    <i class="fa-solid fa-folder-open mb-2" style="font-size: 24px; display: block;"></i>
                    No hay suscripciones cargadas todavía.
                </div>
            `;
        }

        suscripciones.forEach(sub => {
            // 1. Normalizamos el costo a valor mensual individual
            let costoMensualOriginal = sub.periodo === 'anual' ? sub.costo / 12 : sub.costo;
            let costoMensualArs = 0;

            // 2. Traducimos los flujos según la divisa cargada
            if (sub.moneda === 'USD') {
                costoMensualArs = costoMensualOriginal * VALOR_DOLAR_TARJETA;
                totalMensualUsd += costoMensualOriginal;
            } else {
                costoMensualArs = costoMensualOriginal;
                // Sumamos el equivalente inverso al totalizador en dólares del dashboard
                totalMensualUsd += costoMensualOriginal / VALOR_DOLAR_TARJETA;
            }

            totalMensualArs += costoMensualArs;

            // Formateo de etiquetas de la tarjeta
            const prefijoMoneda = sub.moneda === 'USD' ? 'U$S' : '$';
            const etiquetaPeriodo = sub.periodo === 'anual' ? 'año' : 'mes';

            const div = document.createElement('div');
            div.className = 'card d-flex flex-row align-items-center justify-content-between p-3';
            div.style.borderLeft = '4px solid var(--insight-indigo)';
            
            div.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <div style="background: #E8E8FA; color: var(--insight-indigo); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                        <i class="fa-solid fa-tv"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--deep-charcoal);">${sub.nombre}</h4>
                        <small class="text-capitalize" style="color: var(--text-muted); font-size: 12px;">
                            ${sub.periodo} • ${sub.moneda}
                        </small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-4">
                    <div class="text-end">
                        <strong style="display: block; font-size: 16px;">
                            ${prefijoMoneda} ${sub.costo.toFixed(2)} / ${etiquetaPeriodo}
                        </strong>
                        <small style="color: var(--text-muted);">
                            ~ $${costoMensualArs.toLocaleString('es-AR', {maximumFractionDigits: 0})} / mes
                        </small>
                    </div>
                    <button class="btn-delete" onclick="eliminarSub(${sub.id})" style="background: none; border: none; color: #ccc; cursor: pointer; transition: color 0.2s;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            listaContenedor.appendChild(div);
        });

        // Actualizamos las tarjetas de resumen superior (Expresadas como presupuesto mensual equivalente)
        totalUsdDisplay.textContent = `U$S ${totalMensualUsd.toFixed(2)}`;
        totalArsDisplay.textContent = `$ ${totalMensualArs.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('mouseenter', () => btn.style.color = 'var(--alert-red)');
            btn.addEventListener('mouseleave', () => btn.style.color = '#ccc');
        });
    }

    window.eliminarSub = function(id) {
        suscripciones = suscripciones.filter(sub => sub.id !== id);
        actualizarUI();
    };

    if (formSuscripcion) {
        formSuscripcion.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombreSub').value.trim();
            const costo = parseFloat(document.getElementById('costoSub').value);
            const moneda = document.getElementById('monedaSub').value;
            const periodo = document.getElementById('periodoSub').value;

            if (nombre && !isNaN(costo) && costo > 0) {
                const nuevaSub = {
                    id: Date.now(),
                    nombre: nombre,
                    costo: costo,
                    moneda: moneda,
                    periodo: periodo
                };
                
                suscripciones.push(nuevaSub);
                actualizarUI();
                
                // Reseteamos el formulario y devolvemos el ícono del costo a USD (por defecto)
                formSuscripcion.reset();
                if (montoIcon) montoIcon.textContent = 'U$S';
            }
        });
    }

    actualizarUI();
});