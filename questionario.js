const questions = window.akinQuestions;
let currentStep = 0;
let userData = {};

const stepContent = document.getElementById('step-content');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const progressBar = document.querySelector('.progress-bar');
const questionnaireBox = document.getElementById('questionnaire-box');
const resultsBox = document.getElementById('results-box');

// State persistence helpers
function loadState() {
    const savedData = localStorage.getItem('akin_questionnaire_data');
    if (savedData) {
        try {
            userData = JSON.parse(savedData);
        } catch (e) {
            console.error('Erro ao ler dados salvos:', e);
        }
    }
    const savedStep = localStorage.getItem('akin_questionnaire_step');
    if (savedStep !== null) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step) && step >= 0 && step < questions.length) {
            currentStep = step;
        }
    }
}

function saveState() {
    localStorage.setItem('akin_questionnaire_step', currentStep);
    localStorage.setItem('akin_questionnaire_data', JSON.stringify(userData));
}

function clearState() {
    localStorage.removeItem('akin_questionnaire_step');
    localStorage.removeItem('akin_questionnaire_data');
}

function collectInputs() {
    if (currentStep >= questions.length) return;
    const q = questions[currentStep];
    if (q.type === 'input') {
        const inputEl = document.getElementById(q.id);
        if (inputEl) {
            userData[q.id] = inputEl.value;
        }
    } else if (q.type === 'input_group') {
        q.inputs.forEach(input => {
            const inputEl = document.getElementById(input.id);
            if (inputEl) {
                userData[input.id] = inputEl.value;
            }
        });
    }
}

function goToStep(newStep) {
    history.pushState({ step: newStep }, '', window.location.search);
    currentStep = newStep;
    saveState();
    renderStep();
}

function renderStep() {
    if (currentStep >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentStep];

    // Check condition
    if (q.condition && !q.condition(userData)) {
        currentStep++;
        renderStep();
        return;
    }

    // Toggle Back button display
    if (currentStep > 0) {
        backBtn.style.display = 'inline-flex';
    } else {
        backBtn.style.display = 'none';
    }

    progressBar.style.width = `${((currentStep + 1) / questions.length) * 100}%`;

    let html = `<h2 class="q-title">${q.question}</h2>`;
    if (q.description) html += `<p style="text-align:center; color:#666; margin-top:-20px; margin-bottom:20px;">${q.description}</p>`;

    html += `<div class="q-options">`;

    if (q.type === 'single' || q.type === 'multiple' || q.type === 'multiple_grid') {
        q.options.forEach(opt => {
            const isSelected = userData[q.id] && (Array.isArray(userData[q.id]) ? userData[q.id].includes(opt) : userData[q.id] === opt);
            html += `
                <div class="option-btn ${isSelected ? 'selected' : ''}" onclick="window.selectOption('${q.id}', '${opt}', '${q.type}')">
                    ${opt}
                </div>
            `;
        });
    } else if (q.type === 'input') {
        html += `<input type="${q.inputType}" id="${q.id}" class="q-input" placeholder="${q.placeholder || ''}" value="${userData[q.id] || ''}">`;
    } else if (q.type === 'input_group') {
        q.inputs.forEach(input => {
            html += `
                <div class="input-group">
                    <label style="display:block; margin-bottom:5px; font-weight:500;">${input.label}</label>
                    <input type="${input.type}" id="${input.id}" class="q-input" placeholder="${input.placeholder}" value="${userData[input.id] || ''}">
                </div>
            `;
        });
    }

    html += `</div>`;
    stepContent.innerHTML = html;
    
    // Mostra o botão Continuar APENAS se não for pergunta de opção única (pois a única avança automático)
    if (q.type !== 'single') {
        nextBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'none';
    }
}

window.selectOption = (id, value, type) => {
    if (type === 'single') {
        userData[id] = value;
        saveState();
        
        let nextIndex = currentStep + 1;
        while (nextIndex < questions.length) {
            const q = questions[nextIndex];
            if (!q.condition || q.condition(userData)) {
                break;
            }
            nextIndex++;
        }

        setTimeout(() => {
            if (nextIndex < questions.length) {
                goToStep(nextIndex);
            } else {
                history.pushState({ step: 'results' }, '', window.location.search);
                showResults();
            }
        }, 300);
    } else {
        if (!userData[id]) userData[id] = [];
        if (userData[id].includes(value)) {
            userData[id] = userData[id].filter(v => v !== value);
        } else {
            userData[id].push(value);
        }
        saveState();
    }
    renderStep();
};


async function saveLead(data) {
    try {
        console.log('Iniciando processamento do lead...');

        // --- Monta o resumo das respostas para o email ---
        const labels = {
            objetivos: 'Objetivos',
            tratamento_anterior: 'Tratamento anterior?',
            tentativas_anteriores: 'Já tentou',
            tempo_tentativa: 'Tempo tentando emagrecer',
            desafios: 'Maiores desafios',
            nome: 'Nome',
            whatsapp: 'WhatsApp',
            email: 'E-mail',
            peso: 'Peso (kg)',
            altura: 'Altura (cm)',
            target: 'Tem meta de peso?',
            meta_peso: 'Meta de peso (kg)',
            saude_historico: 'Histórico de saúde',
            bariatrica: 'Cirurgia bariátrica?',
            preferencia: 'Prioridade no tratamento'
        };

        let respostasHtml = '';
        Object.entries(labels).forEach(([key, label]) => {
            const valor = data[key];
            if (!valor) return;
            const display = Array.isArray(valor) ? valor.join(', ') : valor;
            const bg = respostasHtml.split('<tr').length % 2 === 0 ? '#f9f9f9' : 'white';
            respostasHtml += `<tr style="background:${bg}"><td style="padding:8px;color:#555;width:200px">${label}</td><td style="padding:8px;font-weight:500">${display}</td></tr>`;
        });

        // Salva o HTML de respostas para enviar ao clicar em 'Quero meu plano'
        window._questionarioRespostasHtml = `<table style="width:100%;border-collapse:collapse">${respostasHtml}</table>`;
        window._questionarioLeadData = { nome: data.nome, email: data.email || '', whatsapp: data.whatsapp, respostas_triagem: data };

        // Integração para captura de lead
        const utms = window.getUtmParams ? window.getUtmParams() : {};
        const response = await fetch('https://n8n.srv1586236.hstgr.cloud/webhook/novo-questionario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'Novo Lead - Avaliação Gratuita',
                lead_id: utms.lead_id || localStorage.getItem('lead_id') || '',
                nome: data.nome,
                whatsapp: data.whatsapp,
                email: data.email || '',
                respostas_triagem: data,
                tipo_origem: 'Questionário',
                utm_source: utms.utm_source || '',
                utm_medium: utms.utm_medium || '',
                utm_campaign: utms.utm_campaign || ''
            })
        });

        const res = await response.json();
        if (res.lead_id) {
            localStorage.setItem('lead_id', res.lead_id);
            console.log('[Flow] Lead ID persistido:', res.lead_id);
        }

    } catch (err) {
        console.error('Erro ao salvar lead:', err.message);
    }
}


function nextStep() {
    // Collect input data
    const q = questions[currentStep];
    if (q.type === 'input') {
        const inputVal = document.getElementById(q.id).value.trim();
        if (!inputVal) {
            alert('Por favor, preencha este campo.');
            return;
        }
        userData[q.id] = inputVal;
    } else if (q.type === 'input_group') {
        let allFilled = true;
        q.inputs.forEach(input => {
            const val = document.getElementById(input.id).value.trim();
            if (!val) {
                allFilled = false;
            }
            userData[input.id] = val;
        });

        if (!allFilled) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // If this is the contact step, save the lead immediately
        if (q.id === 'contato') {
            saveLead(userData);
        }
    }

    saveState();

    let nextIndex = currentStep + 1;
    while (nextIndex < questions.length) {
        const q = questions[nextIndex];
        if (!q.condition || q.condition(userData)) {
            break;
        }
        nextIndex++;
    }

    if (nextIndex < questions.length) {
        goToStep(nextIndex);
    } else {
        history.pushState({ step: 'results' }, '', window.location.search);
        showResults();
    }
}

function showResults() {
    questionnaireBox.style.display = 'none';
    resultsBox.style.display = 'block';
    
    // Clear storage now that questionnaire is complete
    clearState();

    // --- Salva TODOS os dados do questionário neste momento (completo) ---
    const labels = {
        objetivos: 'Objetivos',
        tratamento_anterior: 'Tratamento anterior?',
        tentativas_anteriores: 'Já tentou',
        tempo_tentativa: 'Tempo tentando emagrecer',
        desafios: 'Maiores desafios',
        nome: 'Nome',
        whatsapp: 'WhatsApp',
        email: 'E-mail',
        peso: 'Peso (kg)',
        altura: 'Altura (cm)',
        target: 'Tem meta de peso?',
        meta_peso: 'Meta de peso (kg)',
        saude_historico: 'Histórico de saúde',
        bariatrica: 'Cirurgia bariátrica?',
        preferencia: 'Prioridade no tratamento'
    };
    let rows = '';
    let i = 0;
    Object.entries(labels).forEach(([key, label]) => {
        const valor = userData[key];
        if (!valor) return;
        const display = Array.isArray(valor) ? valor.join(', ') : valor;
        const bg = i++ % 2 === 0 ? 'white' : '#f9f9f9';
        rows += `<tr style="background:${bg}"><td style="padding:10px;color:#555;width:200px;font-weight:500">${label}</td><td style="padding:10px">${display}</td></tr>`;
    });
    window._questionarioRespostasHtml = `<table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif">${rows}</table>`;
    window._questionarioLeadData = { nome: userData.nome, email: userData.email || '', whatsapp: userData.whatsapp };

    const peso = parseFloat(userData.peso);
    const meta = parseFloat(userData.meta_peso) || (peso * 0.85); // Default 15% loss
    const altura = parseFloat(userData.altura) / 100;
    const imc = (peso / (altura * altura)).toFixed(1);

    // Generate Evolution Chart with 5 steps
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '';

    // Create SVG for trend line
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '10';

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--primary-dark)"); 
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-dasharray", "6,6");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    chartContainer.appendChild(svg);

    const targetHeights = [];

    // 5 projections with steeper visual drop
    for (let i = 0; i < 5; i++) {
        const stepRatio = i / 4; // goes from 0 to 1
        const currentProjection = meta + (peso - meta) * Math.pow(1 - stepRatio, 1.8);
        
        // Baseline height at 20% to make the drop visually larger
        const minHeight = 20; 
        const heightPercent = minHeight + ((currentProjection - meta) / (peso - meta)) * (100 - minHeight);
        targetHeights.push(heightPercent);

        const barWrapper = document.createElement('div');
        barWrapper.className = 'chart-col-wrapper';
        barWrapper.style.width = '16%';
        barWrapper.style.display = 'flex';
        barWrapper.style.flexDirection = 'column';
        barWrapper.style.alignItems = 'center';
        barWrapper.style.justifyContent = 'flex-end';
        barWrapper.style.height = '100%';

        const label = document.createElement('div');
        label.style.fontSize = '0.9rem';
        label.style.fontWeight = 'bold';
        label.style.color = '#555';
        label.style.marginBottom = '5px';
        label.innerText = `${currentProjection.toFixed(1)}kg`;

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = '0%';
        bar.style.width = '100%';
        bar.style.borderRadius = '8px 8px 0 0';
        bar.style.background = 'var(--primary-blue)';
        bar.style.transition = 'height 1s cubic-bezier(0.4, 0, 0.2, 1)';

        barWrapper.appendChild(label);
        barWrapper.appendChild(bar);
        chartContainer.appendChild(barWrapper);

        setTimeout(() => {
            bar.style.height = `${heightPercent}%`;
        }, i * 200);
    }

    // Draw SVG trendline coordinates after layout finishes calculation (approx 50ms)
    setTimeout(() => {
        const w = chartContainer.clientWidth;
        const h = chartContainer.clientHeight;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        
        let d = '';
        const wrappers = chartContainer.querySelectorAll('.chart-col-wrapper');
        wrappers.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const containerRect = chartContainer.getBoundingClientRect();
            const x = rect.left - containerRect.left + rect.width / 2;
            const targetY = h - (h * targetHeights[index] / 100); // bottom minus exact bar height
            d += (index === 0 ? 'M' : 'L') + ` ${x},${targetY} `;
        });
        
        path.setAttribute("d", d);
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = length;
        
        // Force reflow and start stroke transition
        path.getBoundingClientRect();
        path.style.transition = 'stroke-dashoffset 2s ease-out';
        path.style.strokeDashoffset = '0';
    }, 100);

    const planDetails = document.getElementById('plan-details');
    planDetails.innerHTML = `
        <div style="text-align: center; background: var(--accent-blue); padding: 20px; border-radius: 16px; margin-bottom: 20px;">
            <h3 style="color: var(--primary-blue); font-size: 1.4rem; margin-bottom: 15px; line-height: 1.3;">Com o plano da Maori, conseguimos levar você até o seu objetivo</h3>
            <p style="font-size: 1.1rem; margin-bottom: 5px;">De <strong>${peso.toFixed(1)}kg</strong> para <strong>${meta.toFixed(1)}kg</strong></p>
            <p style="font-size: 0.95rem; color: #555;">Seu IMC inicial é <strong>${imc}</strong></p>
        </div>
        <div style="border: 1px solid #eee; padding: 20px; border-radius: 16px;">
            <h3 style="margin-bottom: 15px;">O que está incluso:</h3>
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom:10px;">✅ Medicação GLP-1 (Wegovy/Ozempic)</li>
                <li style="margin-bottom:10px;">✅ Suporte médico via WhatsApp 24/7</li>
                <li style="margin-bottom:10px;">✅ Acompanhamento Nutricional</li>
                <li style="margin-bottom:10px;">✅ Entrega garantida e discreta</li>
            </ul>
            <button class="btn btn-primary" style="margin-top: 20px; width: 100%;" onclick="
                const lead = window._questionarioLeadData || {};
                const html = window._questionarioRespostasHtml || '';
                const utms = window.getUtmParams ? window.getUtmParams() : {};
                fetch('https://n8n.srv1586236.hstgr.cloud/webhook/novo-questionario', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipo: 'Questionário Respondido',
                        lead_id: utms.lead_id || localStorage.getItem('lead_id') || '',
                        nome: lead.nome || 'Cliente',
                        email: lead.email || '',
                        whatsapp: lead.whatsapp || '',
                        respostas_html: html,
                        respostas_triagem: userData,
                        tipo_origem: 'Questionário',
                        utm_source: utms.utm_source || '',
                        utm_medium: utms.utm_medium || '',
                        utm_campaign: utms.utm_campaign || ''
                    })
                })
                .then(r => r.json())
                .then(res => {
                    if (res.lead_id) localStorage.setItem('lead_id', res.lead_id);
                })
                .catch(e => console.warn('[n8n]', e))
                .finally(() => {
                    const targetUrl = window.addUtmsToUrl ? window.addUtmsToUrl('oferta.html') : 'oferta.html' + window.location.search;
                    window.location.href = targetUrl;
                });
            ">Garantir meu Plano Personalizado</button>
        </div>
    `;
}

// Navigation Event Listeners
backBtn.addEventListener('click', () => {
    collectInputs();
    saveState();
    history.back();
});

nextBtn.addEventListener('click', nextStep);

window.addEventListener('popstate', (event) => {
    if (event.state) {
        if (event.state.step === 'results') {
            questionnaireBox.style.display = 'none';
            resultsBox.style.display = 'block';
            showResults();
        } else if (typeof event.state.step === 'number') {
            currentStep = event.state.step;
            questionnaireBox.style.display = 'flex';
            resultsBox.style.display = 'none';
            saveState();
            renderStep();
        }
    } else {
        currentStep = 0;
        questionnaireBox.style.display = 'flex';
        resultsBox.style.display = 'none';
        saveState();
        renderStep();
    }
});

// Initialization
loadState();
if (history.state === null) {
    history.replaceState({ step: currentStep }, '', window.location.search);
} else if (history.state && typeof history.state.step === 'number') {
    currentStep = history.state.step;
}

renderStep();
