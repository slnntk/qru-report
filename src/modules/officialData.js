/**
 * @file Gerencia a persistência da configuração do oficial com suporte a seleções múltiplas.
 */
const STORAGE_KEY = 'officialConfig_v2'; // Nova chave para evitar conflito com a versão antiga

// Estrutura de dados padrão ATUALIZADA
const defaultConfig = {
    nomeCompleto: '',
    badge: '',
    passaporte: '',
    isAltoComando: false,
    // Armazena os grupos selecionados como um array de chaves
    selectedGroups: [], // Ex: ['GRA', 'INSTRUTORES']
    // Armazena os cargos como um objeto, mapeando grupo -> cargo
    cargos: {}, // Ex: { GRA: 'Operador(a) Aerotático', INSTRUTORES: 'Coordenador(a) de Instrução' }
};

/**
 * Salva o objeto de configuração completo no localStorage.
 * @param {object} config - O objeto de configuração do oficial.
 */
export function saveOfficialConfig(config) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.error("Falha ao salvar a configuração do oficial:", e);
    }
}

/**
 * Carrega a configuração do oficial do localStorage.
 * @returns {object} A configuração salva ou a padrão.
 */
export function loadOfficialConfig() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        // Funde os dados salvos com o padrão para garantir que todas as chaves existam
        return savedData ? { ...defaultConfig, ...JSON.parse(savedData) } : defaultConfig;
    } catch (e) {
        console.error("Falha ao carregar a configuração do oficial:", e);
        return defaultConfig;
    }
}