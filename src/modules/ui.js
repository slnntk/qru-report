export function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const openBtn = document.getElementById("open_btn");
    if (sidebar && openBtn) {
        openBtn.addEventListener("click", () => sidebar.classList.toggle("open-sidebar"));
    }
}

export function initTheme() {
    const toggleBtn = document.getElementById("toggle-dark");
    if (!toggleBtn) return;
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.classList.add("dark-mode");
    }
    toggleBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark-mode");
        const theme = document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
        localStorage.setItem("theme", theme);
    });
}

export function initAccordion() {
    document.querySelectorAll(".accordion-item").forEach(item => {
        const header = item.querySelector(".accordion-header");
        if (!header) return;
        header.addEventListener("click", () => {
            const content = item.querySelector(".accordion-content");
            const isActive = item.classList.contains("active");
            document.querySelectorAll(".accordion-item.active").forEach(other => {
                if (other !== item) {
                    other.classList.remove("active");
                    const otherContent = other.querySelector(".accordion-content");
                    if (otherContent) otherContent.style.maxHeight = null;
                }
            });
            if (isActive) {
                item.classList.remove("active");
                content.style.maxHeight = null;
            } else {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + 400 + "px";
            }
        });
    });
}

export function initServiceCallToggle() {
    const tabButtons = document.querySelectorAll('.sub-tab-button');
    const tabContents = document.querySelectorAll('.sub-tab-content');
    if (tabButtons.length === 0) return;
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}

// ==================================================================
// Lógica Corrigida para a UI da Configuração do Oficial
// ==================================================================

// Variáveis de escopo do módulo
let cargosData = {};
let officialConfig = {};
let onConfigChange = () => {}; // Callback para notificar o "maestro"

/**
 * Cria e gerencia um seletor de cargo para um grupo específico.
 * @param {string} groupKey - A chave do grupo (ex: 'GRA').
 */
function manageCargoSelector(groupKey) {
    const container = document.getElementById('cargo-selectors-container');
    let wrapper = document.getElementById(`cargo-wrapper-${groupKey}`);
    const isSelected = officialConfig.selectedGroups.includes(groupKey);

    if (!isSelected) {
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    const cargos = cargosData[groupKey];
    if (!cargos || cargos.length === 0) return;

    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = `cargo-wrapper-${groupKey}`;
        wrapper.className = 'cargo-selector-wrapper form-group';

        const label = document.createElement('label');
        label.setAttribute('for', `cargo-select-${groupKey}`);
        label.textContent = `Cargo em ${groupKey}`;

        const select = document.createElement('select');
        select.id = `cargo-select-${groupKey}`;
        select.innerHTML = cargos.map(cargo => `<option value="${cargo}">${cargo}</option>`).join('');

        select.addEventListener('change', (e) => {
            officialConfig.cargos[groupKey] = e.target.value;
            onConfigChange(officialConfig);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        container.appendChild(wrapper);
    }

    const select = wrapper.querySelector('select');
    select.value = officialConfig.cargos[groupKey] || cargos[0];
    wrapper.style.display = 'block';
}

/**
 * Atualiza o estado visual de todos os emblemas e seus seletores de cargo.
 */
function updateConfigSelectionUI() {
    document.querySelectorAll('.icon-selectors .icon-selector').forEach(selector => {
        const groupKey = selector.dataset.group;
        const isActive = (groupKey === 'ALTO_COMANDO' && officialConfig.isAltoComando) ||
            officialConfig.selectedGroups.includes(groupKey);

        selector.classList.toggle('active', isActive);

        if (groupKey !== 'ALTO_COMANDO') {
            manageCargoSelector(groupKey);
        }
    });
}

/**
 * Inicializa a UI da seção "Configuração do Oficial".
 */
export function initOfficialConfigUI(initialConfig, loadedCargos, configChangeCallback) {
    officialConfig = initialConfig;
    cargosData = loadedCargos;
    onConfigChange = configChangeCallback;

    // Preenche os campos de texto do oficial
    document.getElementById('user-nome').value = officialConfig.nomeCompleto;
    document.getElementById('user-badge').value = officialConfig.badge;
    document.getElementById('user-passaporte').value = officialConfig.passaporte;

    // Listeners para os campos de texto com as chaves CORRIGIDAS
    const textInputMap = {
        'user-nome': 'nomeCompleto',
        'user-badge': 'badge',
        'user-passaporte': 'passaporte'
    };

    Object.entries(textInputMap).forEach(([id, key]) => {
        document.getElementById(id).addEventListener('input', (e) => {
            officialConfig[key] = e.target.value;
            onConfigChange(officialConfig);
        });
    });

    // Listeners para os emblemas com a lógica de multi-seleção
    document.querySelectorAll('.icon-selectors .icon-selector').forEach(selector => {
        selector.addEventListener('click', () => {
            const groupKey = selector.dataset.group;

            if (groupKey === 'ALTO_COMANDO') {
                officialConfig.isAltoComando = !officialConfig.isAltoComando;
            } else {
                const index = officialConfig.selectedGroups.indexOf(groupKey);
                if (index > -1) {
                    officialConfig.selectedGroups.splice(index, 1);
                    delete officialConfig.cargos[groupKey];
                } else {
                    officialConfig.selectedGroups.push(groupKey);
                    if (cargosData[groupKey]?.length > 0) {
                        officialConfig.cargos[groupKey] = cargosData[groupKey][0];
                    }
                }
            }

            updateConfigSelectionUI();
            onConfigChange(officialConfig);
        });
    });

    // Define o estado visual inicial da UI com base nos dados carregados
    updateConfigSelectionUI();
}