document.addEventListener('DOMContentLoaded', () => {
    const btnDividir = document.getElementById('btnDividir');
    const btnAddPerson = document.getElementById('btnAddPerson');
    const participantsContainer = document.getElementById('participantsContainer');
    const resultBox = document.getElementById('resultadoDivisor');

    // 1. UTILIDAD: Aplicar máscara de miles a un input
    function applyMask(input) {
        input.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor !== '') {
                valor = parseInt(valor, 10).toLocaleString('es-AR');
            }
            this.value = valor;
        });
    }

    // Aplicamos la máscara a los dos inputs que vienen por defecto en el HTML
    document.querySelectorAll('.form-control-monto').forEach(applyMask);

    // 2. LÓGICA DE INTERFAZ: Agregar nuevas filas
    if (btnAddPerson) {
        btnAddPerson.addEventListener('click', () => {
            const newRow = document.createElement('div');
            newRow.className = 'participant-row';
            newRow.style.display = 'flex';
            newRow.style.gap = '10px';
            newRow.style.marginBottom = '12px';
            newRow.style.alignItems = 'center';

            newRow.innerHTML = `
                <div class="input-with-icon" style="flex: 1; min-width: 0;">
                    <i class="fa-solid fa-user"></i>
                    <input type="text" class="part-name" placeholder="Nombre">
                </div>
                <div class="input-with-icon" style="flex: 1; min-width: 0;">
                    <i>$</i>
                    <input type="text" inputmode="numeric" class="part-amount form-control-monto" placeholder="Puso 0">
                </div>
                <button type="button" class="btn-delete-row" title="Borrar"
                    style="background: none; border: none; color: var(--alert-red); cursor: pointer; padding: 4px; font-size: 14px; width: 28px; height: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            
            participantsContainer.appendChild(newRow);
            
            // Le aplicamos la lógica de miles al nuevo input recién creado
            applyMask(newRow.querySelector('.form-control-monto'));

            // Funcionalidad para borrar esa fila si el usuario se arrepiente
            newRow.querySelector('.btn-delete-row').addEventListener('click', function() {
                newRow.remove();
            });
        });
    }

    // 3. LÓGICA FINANCIERA: Conciliación de saldos
    if (btnDividir) {
        btnDividir.addEventListener('click', () => {
            const rows = document.querySelectorAll('.participant-row');
            let totalGasto = 0;
            let participantes = [];

            // Recopilamos todos los datos de las filas
            rows.forEach((row, index) => {
                const nameInput = row.querySelector('.part-name').value.trim();
                const amountStr = row.querySelector('.part-amount').value.replace(/\./g, '');
                const amount = parseFloat(amountStr) || 0; // Si dejó el campo vacío, cuenta como 0
                
                const nombre = nameInput !== '' ? nameInput : `Persona ${index + 1}`;
                
                participantes.push({ nombre, pago: amount, balance: 0 });
                totalGasto += amount;
            });

            if (participantes.length < 2) {
                alert('Se necesitan al menos 2 personas para armar la liquidación.');
                return;
            }
            if (totalGasto === 0) {
                alert('La cuenta da cero. Alguien tiene que haber puesto plata.');
                return;
            }

            // Calculamos cuánto le toca pagar realmente a cada uno
            const cuotaPorPersona = totalGasto / participantes.length;

            let deudores = [];
            let acreedores = [];

            // Calculamos los balances
            // Balance Positivo = Puso de más (es acreedor, le deben plata)
            // Balance Negativo = Puso de menos (es deudor, tiene que transferir)
            participantes.forEach(p => {
                p.balance = p.pago - cuotaPorPersona;
                if (p.balance < -0.01) deudores.push(p);
                if (p.balance > 0.01) acreedores.push(p);
            });

            // Algoritmo de compensación para emparejar deudas
            let transferencias = [];
            let i = 0; // Índice de deudores
            let j = 0; // Índice de acreedores

            while (i < deudores.length && j < acreedores.length) {
                let deuda = Math.abs(deudores[i].balance);
                let credito = acreedores[j].balance;
                
                // Se liquida el valor más chico entre la deuda y el crédito
                let montoTransferir = Math.min(deuda, credito);
                
                transferencias.push({
                    desde: deudores[i].nombre,
                    hacia: acreedores[j].nombre,
                    monto: montoTransferir
                });
                
                // Actualizamos los balances de ambos
                deudores[i].balance += montoTransferir;
                acreedores[j].balance -= montoTransferir;
                
                // Si el balance llegó a cero, pasamos al siguiente de la lista
                if (Math.abs(deudores[i].balance) < 0.01) i++;
                if (Math.abs(acreedores[j].balance) < 0.01) j++;
            }

            // 4. RENDERIZADO VISUAL
            document.getElementById('resTotalCuenta').textContent = `$${totalGasto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resPorPersona').textContent = `$${cuotaPorPersona.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            const transferList = document.getElementById('transferList');
            transferList.innerHTML = '<h4 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase;">Quién le pasa a quién:</h4>';
            
            if (transferencias.length === 0) {
                transferList.innerHTML += '<p style="font-size: 16px; font-weight: 600; color: var(--growth-green);">¡Están todos a mano! 🍻</p>';
            } else {
                transferencias.forEach(t => {
                    transferList.innerHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--clean-white); border-radius: 6px; margin-bottom: 8px; border: 1px solid var(--border-light);">
                            <span style="font-weight: 500;">${t.desde} <i class="fa-solid fa-arrow-right" style="color: var(--growth-green); margin: 0 8px;"></i> ${t.hacia}</span>
                            <strong style="color: var(--deep-charcoal);">$${t.monto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                        </div>
                    `;
                });
            }

            // Guardamos la info temporal en el navegador para que el botón de WhatsApp pueda leerla
            window.lastTransfers = transferencias;
            window.lastTotal = totalGasto;

            resultBox.style.display = 'block';
            setTimeout(() => {
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        });
    }
});

// Función dinámica para WhatsApp
function compartirWhatsAppDivisor() {
    const motivo = document.getElementById('motivoGasto').value || 'la juntada';
    const transferencias = window.lastTransfers || [];
    const total = window.lastTotal || 0;

    let mensaje = `¡Buenas! Paso la liquidación de ${motivo} 📊\n\n`;
    mensaje += `💰 *Gasto total: $${total.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}*\n\n`;
    
    if (transferencias.length === 0) {
        mensaje += `¡Están todos a mano! ✅`;
    } else {
        mensaje += `💸 *TRANSFERENCIAS:*\n`;
        transferencias.forEach(t => {
            mensaje += `👉 ${t.desde} le pasa *$${t.monto.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}* a ${t.hacia}\n`;
        });
        mensaje += `\nAvisen cuando transfieran así tildamos ✅`;
    }

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}