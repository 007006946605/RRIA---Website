/**
 * Arquitetura de Dados - JavaScript
 * Base reaproveitada do Motor de Decisão
 * Novas funcionalidades: Lupa Forense, Painel Raio-X, DER Animado
 */

// Estado da aplicação
let selectedEvent = null;
let magnifierActive = false;
let xrayPanelActive = false;
let derVisible = false;

// Variáveis para elementos DOM (inicializadas no carregamento)
let mapSvg, magnifierOverlay, magnifierContent, xrayPanel, xrayDataContainer, xrayRelationsContainer, derContainer, btnShowDer, btnClearAll, xrayCloseBtn;

// Dados dos eventos (simulando banco de dados)
const eventosDB = {
    acidente: {
        id: "EVT-002",
        tipo: "Zona de Risco",
        icone: "M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16",
        coordenadas: "x: 400, y: 150",
        impacto: "Crítico - Interdição",
        descricao: "Cruzamento bloqueado. Risco de colisão iminente identificado.",
        origem: "Tabela: EVENTOS (Risco)",
        cor: "#e74c3c"
    }
};

// Relações do banco de dados
const relacoesDB = {
    acidente: [
        "Evento → bloqueia → Cruzamento Norte",
        "Rota Original → recalculada → Desvio Leste",
        "Status → altera → PERIGO"
    ]
};

/**
 * Event Listeners e Inicialização
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando script Arquitetura de Dados...');

    // Inicializa referências DOM
    mapSvg = document.getElementById('data-map');
    magnifierOverlay = document.getElementById('magnifier-overlay');
    magnifierContent = document.getElementById('magnifier-content');
    xrayPanel = document.getElementById('xray-panel');
    xrayDataContainer = document.getElementById('xray-data');
    xrayRelationsContainer = document.getElementById('xray-relations');
    derContainer = document.getElementById('der-container');
    btnShowDer = document.getElementById('btn-show-der');
    btnClearAll = document.getElementById('btn-clear');
    xrayCloseBtn = document.getElementById('xray-close');

    if (!btnShowDer || !derContainer) {
        console.error('Erro crítico: Elementos do DOM não encontrados!', { btnShowDer, derContainer });
        // Tentativa de recuperação ou log adicional
        if (!btnShowDer) console.error('Botão btn-show-der não encontrado');
        if (!derContainer) console.error('Container der-container não encontrado');
        return;
    }

    // Eventos clicáveis no mapa
    document.querySelectorAll('.event-marker-group').forEach(marker => {
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventType = marker.dataset.event;
            showMagnifier(eventType);
        });
    });

    // Fechar lupa ao clicar no overlay
    if (magnifierOverlay) {
        magnifierOverlay.addEventListener('click', (e) => {
            if (e.target === magnifierOverlay) {
                closeMagnifier();
            }
        });
    }

    // Botão fechar painel X-Ray
    if (xrayCloseBtn) xrayCloseBtn.addEventListener('click', closeXRayPanel);

    // Botão mostrar DER
    btnShowDer.addEventListener('click', (e) => {
        console.log('Botão DER clicado!');
        e.preventDefault(); // Previne qualquer comportamento padrão estranho
        showDER();
    });

    // Botão limpar tudo
    if (btnClearAll) btnClearAll.addEventListener('click', clearAll);

    console.log('Arquitetura de Dados carregada com sucesso!');
});

/**
 * Mostra a lupa forense com informações do evento
 */
function showMagnifier(eventType) {
    if (!magnifierContent || !magnifierOverlay) return;
    console.log('Ativando lupa forense para:', eventType);

    const eventData = eventosDB[eventType];
    if (!eventData) return;

    selectedEvent = eventType;
    magnifierActive = true;

    // Popula conteúdo da lupa
    magnifierContent.innerHTML = `
        <svg class="magnifier-icon" viewBox="0 0 24 24">
            <path d="${eventData.icone}" fill="${eventData.cor}"/>
        </svg>
        <div class="magnifier-info">
            <strong>${eventData.tipo}</strong>
            ID: ${eventData.id}<br>
            ${eventData.coordenadas}<br>
            <span style="color: ${eventData.cor}; font-weight: 600;">${eventData.impacto}</span>
        </div>
    `;

    // Mostra overlay e lupa
    magnifierOverlay.classList.add('active');

    // Abre painel X-Ray automaticamente após lupa
    setTimeout(() => {
        showXRayPanel(eventType);
    }, 800);
}

/**
 * Abre o painel Raio-X com dados detalhados
 */
function showXRayPanel(eventType) {
    if (!xrayPanel || !xrayDataContainer) return;
    console.log('Abrindo painel Raio-X para:', eventType);

    const eventData = eventosDB[eventType];
    const relations = relacoesDB[eventType];

    // Popula dados
    xrayDataContainer.innerHTML = `
        <div class="xray-data-row">
            <span class="xray-data-label">ID:</span>
            <span class="xray-data-value">${eventData.id}</span>
        </div>
        <div class="xray-data-row">
            <span class="xray-data-label">Tipo:</span>
            <span class="xray-data-value">${eventData.tipo}</span>
        </div>
        <div class="xray-data-row">
            <span class="xray-data-label">Impacto:</span>
            <span class="xray-data-value">${eventData.impacto}</span>
        </div>
        <div class="xray-data-row">
            <span class="xray-data-label">Descrição:</span>
            <span class="xray-data-value">${eventData.descricao}</span>
        </div>
        <div class="xray-data-row">
            <span class="xray-data-label">Origem BD:</span>
            <span class="xray-data-value">${eventData.origem}</span>
        </div>
    `;

    // Popula relações
    if (xrayRelationsContainer && relations) {
        xrayRelationsContainer.innerHTML = relations.map(rel =>
            `<li>${rel}</li>`
        ).join('');
    }

    // Abre painel
    xrayPanel.classList.add('active');
    xrayPanelActive = true;
}

/**
 * Fecha lupa e overlay
 */
function closeMagnifier() {
    console.log('Fechando lupa');
    if (magnifierOverlay) magnifierOverlay.classList.remove('active');
    magnifierActive = false;
}

/**
 * Fecha painel X-Ray
 */
function closeXRayPanel() {
    console.log('Fechando painel Raio-X');
    if (xrayPanel) xrayPanel.classList.remove('active');
    xrayPanelActive = false;
}

/**
 * Mostra o DER completo animado
 */
function showDER() {
    console.log('Mostrando DER completo');
    if (!derContainer || !btnShowDer) return;

    // Ícone SVG para usar no botão
    const chartIcon = '<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24"><path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" /></svg>';
    const upIcon = '<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24"><path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" /></svg>';

    if (derVisible) {
        derContainer.classList.remove('active');
        derVisible = false;
        btnShowDer.innerHTML = `${chartIcon} <span>Mostrar Toda Arquitetura</span>`;
    } else {
        derContainer.classList.add('active');
        derVisible = true;
        btnShowDer.innerHTML = `${upIcon} <span>Ocultar Arquitetura</span>`;

        // Scroll suave até o DER
        setTimeout(() => {
            derContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

/**
 * Limpa toda a simulação
 */
function clearAll() {
    console.log('Limpando simulação completa');

    // Fecha lupa
    closeMagnifier();

    // Fecha painel
    closeXRayPanel();

    // Oculta DER
    const chartIcon = '<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24"><path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" /></svg>';

    if (derVisible && derContainer) {
        derContainer.classList.remove('active');
        derVisible = false;
        if (btnShowDer) btnShowDer.innerHTML = `${chartIcon} <span>Mostrar Toda Arquitetura</span>`;
    }

    // Reseta seleção
    selectedEvent = null;

    console.log('Simulação limpa!');
}
