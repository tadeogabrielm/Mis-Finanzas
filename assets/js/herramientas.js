document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DE PESTAÑAS (TABS CENTRALIZADAS) ---
    const btnTabTEA = document.getElementById('btnTabTEA');
    const btnTabPlazoFijo = document.getElementById('btnTabPlazoFijo');
    const btnTabPrestamos = document.getElementById('btnTabPrestamos');
    
    const paneTEA = document.getElementById('paneTEA');
    const panePlazoFijo = document.getElementById('panePlazoFijo');
    const panePrestamos = document.getElementById('panePrestamos');

    function alternarSolapas(tabName) {
        // Reseteamos estados activos de botones
        btnTabTEA.classList.remove('active');
        btnTabPlazoFijo.classList.remove('active');
        btnTabPrestamos.classList.remove('active');
        
        // Escondemos todos los paneles con d-none de Bootstrap
        paneTEA.classList.add('d-none');
        panePlazoFijo.classList.add('d-none');
        panePrestamos.classList.add('d-none');

        // Activamos el seleccionado
        if (tabName === 'TEA') {
            btnTabTEA.classList.add('active');
            paneTEA.classList.remove('d-none');
        } else if (tabName === 'PF') {
            btnTabPlazoFijo.classList.add('active');
            panePlazoFijo.classList.remove('d-none');
        } else if (tabName === 'PRESTAMOS') {
            btnTabPrestamos.classList.add('active');
            panePrestamos.classList.remove('d-none');
        }
    }

    if (btnTabTEA) btnTabTEA.addEventListener('click', () => alternarSolapas('TEA'));
    if (btnTabPlazoFijo) btnTabPlazoFijo.addEventListener('click', () => alternarSolapas('PF'));
    if (btnTabPrestamos) btnTabPrestamos.addEventListener('click', () => alternarSolapas('PRESTAMOS'));

    // --- 2. MÁSCARA DE MILES GLOBAL ---
    document.querySelectorAll('.form-control-monto').forEach(input => {
        input.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor !== '') {
                valor = parseInt(valor, 10).toLocaleString('es-AR');
            }
            this.value = valor;
        });
    });

    // --- 3. LÓGICA: CONVERSOR TEA ---
    const btnCalcularTEA = document.getElementById('btnCalcularTEA');
    if (btnCalcularTEA) {
        btnCalcularTEA.addEventListener('click', () => {
            const tnaInput = parseFloat(document.getElementById('tnaTEA').value);
            const diasInput = parseInt(document.getElementById('diasTEA').value);

            if (isNaN(tnaInput) || tnaInput <= 0) {
                alert('Ingresá una Tasa Nominal Anual (TNA) válida.');
                return;
            }
            if (isNaN(diasInput) || diasInput <= 0) {
                alert('Ingresá una frecuencia de días válida (Ej: 30).');
                return;
            }

            const tnaDecimal = tnaInput / 100; 
            const base = 1 + (tnaDecimal * diasInput / 365);
            const exponente = 365 / diasInput;
            const teaDecimal = Math.pow(base, exponente) - 1;
            const teaPorcentaje = teaDecimal * 100;

            document.getElementById('resTNA').textContent = `${tnaInput.toFixed(2)}%`;
            document.getElementById('resTEA').textContent = `${teaPorcentaje.toFixed(2)}%`;

            const resultBox = document.getElementById('resultadoTEA');
            resultBox.classList.remove('d-none');
            setTimeout(() => { resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
        });
    }

    // --- 4. LÓGICA: PLAZO FIJO ---
    const btnCalcularPF = document.getElementById('btnCalcularPF');
    if (btnCalcularPF) {
        btnCalcularPF.addEventListener('click', () => {
            const capitalInput = document.getElementById('capitalPF').value;
            const tnaInput = document.getElementById('tnaPF').value;
            const diasInput = document.getElementById('diasPF').value;

            const capital = parseFloat(capitalInput.replace(/\./g, ''));
            const tna = parseFloat(tnaInput);
            const dias = parseInt(diasInput);

            if (isNaN(capital) || capital <= 0) {
                alert('Ingresá un capital válido.');
                return;
            }
            if (isNaN(tna) || tna <= 0) {
                alert('Ingresá una Tasa Nominal Anual (TNA) válida.');
                return;
            }
            if (isNaN(dias) || dias < 30) {
                alert('El plazo fijo tradicional requiere un mínimo de 30 días.');
                return;
            }

            const interesGanado = (capital * tna * dias) / 36500;
            const totalCobrar = capital + interesGanado;

            document.getElementById('resCapitalPF').textContent = `$${capital.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resInteresPF').textContent = `+$${interesGanado.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resTotalPF').textContent = `$${totalCobrar.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            const resultBox = document.getElementById('resultadoPF');
            resultBox.classList.remove('d-none');
            setTimeout(() => { resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
        });
    }

    // --- 5. LÓGICA: PRÉSTAMOS (SISTEMA FRANCÉS) ---
    const btnCalcularPrestamo = document.getElementById('btnCalcularPrestamo');
    const resultBoxPrestamo = document.getElementById('resultadoPrestamo');
    const tablaBody = document.getElementById('tablaAmortizacionBody');

    if (btnCalcularPrestamo) {
        btnCalcularPrestamo.addEventListener('click', () => {
            const montoRaw = document.getElementById('montoPrestamo').value;
            const meses = parseInt(document.getElementById('plazoPrestamo').value);
            const tnaInput = parseFloat(document.getElementById('tnaPrestamo').value);

            const capitalInicial = parseFloat(montoRaw.replace(/\./g, ''));

            if (isNaN(capitalInicial) || capitalInicial <= 0) {
                alert('Ingrese el monto solicitado del préstamo.');
                return;
            }
            if (isNaN(meses) || meses <= 0) {
                alert('Ingrese un plazo en meses válido.');
                return;
            }
            if (isNaN(tnaInput) || tnaInput <= 0) {
                alert('Ingrese la Tasa Nominal Anual (TNA).');
                return;
            }

            const tnaDecimal = tnaInput / 100;
            const tem = tnaDecimal / 12; // Tasa Efectiva Mensual

            const factor = Math.pow(1 + tem, meses);
            const cuotaMensual = capitalInicial * (tem * factor) / (factor - 1);
            
            const costoTotalDevolucion = cuotaMensual * meses;
            const totalIntereses = costoTotalDevolucion - capitalInicial;

            document.getElementById('resCuotaPrestamo').textContent = `$${cuotaMensual.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resInteresPrestamo').textContent = `$${totalIntereses.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('resTotalPrestamo').textContent = `$${costoTotalDevolucion.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            // Renderizado dinámico de la tabla de amortización
            tablaBody.innerHTML = '';
            let saldoRestante = capitalInicial;

            for (let mes = 1; mes <= meses; mes++) {
                const interesPeriodo = saldoRestante * tem;
                const amortizacionCapital = cuotaMensual - interesPeriodo;
                saldoRestante -= amortizacionCapital;

                const saldoDisplay = Math.max(0, saldoRestante);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${mes}</strong></td>
                    <td>$${cuotaMensual.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>$${interesPeriodo.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>$${amortizacionCapital.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>$${saldoDisplay.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                `;
                tablaBody.appendChild(tr);
            }

            resultBoxPrestamo.classList.remove('d-none');
            setTimeout(() => { resultBoxPrestamo.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
        });
    }
});