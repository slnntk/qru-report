/**
 * @file Ponto de entrada principal (maestro) para a página de comunicação.
 * @description Orquestra a inicialização de todos os módulos da aplicação.
 */

// Módulos de dados e configuração
import { loadOfficialConfig, saveOfficialConfig } from './src/modules/officialData.js';
import pontosDeReferenciaData from './pontos_referencia.json';

// Módulos de UI e interatividade
import { initSidebar, initTheme, initAccordion, initServiceCallToggle, initOfficialConfigUI } from './src/modules/ui.js';
import { initClipboard } from './src/modules/clipboard.js';
import { setupAutocomplete } from './src/modules/autocomplete.js';

// Módulos de lógica de templates e geradores
// CORREÇÃO: O nome do arquivo foi ajustado para "dynamicTemplates.js" (plural) para corresponder ao seu arquivo original.
import { updateAllTemplates } from './src/modules/dynamicTemplates.js';
import { initCod0Generator, updateCod0Message } from './src/modules/cod0Generator.js';

/**
 * Função a ser chamada sempre que a configuração do oficial for alterada pela UI.
 * Ela salva os novos dados e atualiza todos os templates relevantes.
 * @param {object} newConfig - O objeto de configuração atualizado.
 */
function handleConfigChange(newConfig) {
    saveOfficialConfig(newConfig);
    updateAllTemplates(newConfig);
    updateCod0Message(); // Atualiza a mensagem do COD 0, que depende dos dados do oficial
}

/**
 * Função principal assíncrona para iniciar a aplicação.
 */
async function main() {
    // 1. Inicializar UI geral que não depende de dados
    initSidebar();
    initTheme();
    initAccordion();
    initServiceCallToggle();
    initClipboard();

    // 2. Carregar dados externos
    const officialConfig = loadOfficialConfig();
    const pontosDeReferencia = pontosDeReferenciaData.sort();
    let cargosData = {};
    try {
        const response = await fetch('./data/cargos.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        cargosData = await response.json();
    } catch (e) {
        console.error("Falha fatal ao carregar cargos.json. A funcionalidade de cargos será limitada.", e);
    }

    // 3. Inicializar a UI de configuração do oficial, passando os dados e o callback
    initOfficialConfigUI(officialConfig, cargosData, handleConfigChange);

    // 4. Inicializar outros módulos que dependem de dados
    initCod0Generator(); // O gerador de Cód 0 já lê dos campos de input

    // 5. Configurar listeners para campos que afetam templates, mas não a config principal
    const simpleTemplateInputs = [
        "cod0-viatura", "radio-veiculo", "radio-cor", "radio-qru", "radio-qth",
        "radio-qrr-numero", "cp-bo-veiculo", "mecanica-qth", "hospital-qth",
        "hospital-ocorrencia", "911-nome-civil", "911-local"
    ];
    simpleTemplateInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => updateAllTemplates(officialConfig));
        }
    });
    // Listener para o select do rádio
    const radioPref = document.getElementById("radio-qrr-preferencia");
    if (radioPref) radioPref.addEventListener('change', () => updateAllTemplates(officialConfig));

    // 6. Configurar o autocomplete para os campos necessários
    setupAutocomplete(document.getElementById("radio-qth"), pontosDeReferencia, () => updateAllTemplates(officialConfig));
    setupAutocomplete(document.getElementById("mecanica-qth"), pontosDeReferencia, () => updateAllTemplates(officialConfig));
    setupAutocomplete(document.getElementById("hospital-qth"), pontosDeReferencia, () => updateAllTemplates(officialConfig));
    setupAutocomplete(document.getElementById("911-local"), pontosDeReferencia, () => updateAllTemplates(officialConfig));

    // 7. Chamar a atualização de todos os templates uma vez na carga inicial
    updateAllTemplates(officialConfig);
    updateCod0Message();

    console.log("Aplicação de Comunicação inicializada com sucesso!");
}

// Inicia a aplicação quando o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', main);