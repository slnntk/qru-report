/**
 * @file Gerencia a lógica do gerador de COD 0 com UI aprimorada e ordenação por patente.
 */

// A ordem aqui define a hierarquia. A maior patente tem o menor índice (0).
const ORDEM_PATENTES = [
    "Comissário", "Coronel", "Tenente Coronel", "Major", "Capitão",
    "1º Tenente", "2º Tenente", "Sub tenente", "1º Sargento", "2º Sargento",
    "3º Sargento", "Cabo", "Soldado 1º Classe", "Soldado 2º Classe", "Aluno"
];

let tripulacao = []; // Array para armazenar os objetos { patente, nome }

/**
 * Ordena a tripulação com base na hierarquia de patentes (maior para menor).
 * @returns {Array<object>} A lista de tripulação ordenada.
 */
function getSortedTripulacao() {
    // Pega os dados do oficial principal dos campos de configuração
    const nomeOficialPrincipal = document.getElementById('user-nome')?.value || "";

    // Cria um array temporário com todos os membros (principal + adicionados)
    let todosOsMembros = [...tripulacao];

    // Adiciona o oficial principal à lista se o nome estiver preenchido
    if (nomeOficialPrincipal) {
        const partes = nomeOficialPrincipal.trim().split(' ');
        const patente = partes[0];
        const nome = partes.slice(1).join(' ');
        if (ORDEM_PATENTES.includes(patente) && nome) {
            todosOsMembros.push({ patente, nome });
        }
    }

    // Ordena o array completo
    return todosOsMembros.sort((a, b) => {
        const indexA = ORDEM_PATENTES.indexOf(a.patente);
        const indexB = ORDEM_PATENTES.indexOf(b.patente);
        return indexA - indexB;
    });
}

/**
 * Atualiza e exibe a mensagem final do COD 0 no elemento <pre>.
 */
export function updateCod0Message() {
    const viatura = document.getElementById('cod0-viatura')?.value || "[VIATURA]";
    const outputElement = document.getElementById("cod0-output");

    if (!outputElement) return;

    const tripulacaoOrdenada = getSortedTripulacao();

    // Formata o texto da tripulação
    let tripulacaoTexto = "N/A";
    if (tripulacaoOrdenada.length > 0) {
        const nomes = tripulacaoOrdenada.map(oficial => `${oficial.patente} ${oficial.nome}`);
        // Junta com vírgula, e usa "e" para o último
        if (nomes.length === 1) {
            tripulacaoTexto = nomes[0];
        } else {
            tripulacaoTexto = nomes.slice(0, -1).join(', ') + ' e ' + nomes.slice(-1);
        }
    }

    // CORREÇÃO: Usa o novo modelo de texto solicitado
    const mensagem = `QAP Central, viatura ${viatura} iniciando patrulhamento em COD 0. Tripulada pelo ${tripulacaoTexto}.`;

    outputElement.textContent = mensagem;
}

/**
 * Renderiza a lista de oficiais da tripulação (apenas os adicionados).
 */
function renderTripulacaoList() {
    const listElement = document.getElementById('tripulacao-list');
    if (!listElement) return;

    listElement.innerHTML = ''; // Limpa a lista antes de renderizar

    // Ordena apenas a tripulação ADICIONADA para exibição na lista
    const tripulacaoAdicionadaOrdenada = [...tripulacao].sort((a, b) => {
        const indexA = ORDEM_PATENTES.indexOf(a.patente);
        const indexB = ORDEM_PATENTES.indexOf(b.patente);
        return indexA - indexB;
    });

    tripulacaoAdicionadaOrdenada.forEach(oficial => {
        const div = document.createElement('div');
        div.className = 'tripulacao-item';
        div.innerHTML = `
            <span>${oficial.patente} ${oficial.nome}</span>
            <button class="remove-oficial-btn" data-nome="${oficial.nome}" title="Remover Oficial">&times;</button>
        `;
        listElement.appendChild(div);
    });

    // Adiciona listeners aos novos botões de remoção
    document.querySelectorAll('.remove-oficial-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const nomeParaRemover = e.currentTarget.dataset.nome;
            tripulacao = tripulacao.filter(oficial => oficial.nome !== nomeParaRemover);
            renderTripulacaoList();
            updateCod0Message();
        });
    });
}

/**
 * Inicializa os listeners de eventos para a seção COD 0.
 */
export function initCod0Generator() {
    const addOficialBtn = document.getElementById('add-oficial-btn');
    const patenteSelect = document.getElementById('cod0-patente');
    const nomeInput = document.getElementById('cod0-nome-oficial');
    const viaturaInput = document.getElementById('cod0-viatura');
    const oficialPrincipalInput = document.getElementById('user-nome');

    if (addOficialBtn && patenteSelect && nomeInput) {
        addOficialBtn.addEventListener('click', () => {
            const patente = patenteSelect.value;
            const nome = nomeInput.value.trim();

            if (nome) {
                // Verifica se o oficial já foi adicionado
                if (tripulacao.some(oficial => oficial.nome.toLowerCase() === nome.toLowerCase())) {
                    alert("Este oficial já foi adicionado à tripulação.");
                    return;
                }
                tripulacao.push({ patente, nome });
                nomeInput.value = ''; // Limpa o campo
                nomeInput.focus(); // Coloca o foco de volta no campo de nome
                renderTripulacaoList();
                updateCod0Message();
            } else {
                alert("Por favor, digite o nome do oficial.");
            }
        });
    }

    // Atualiza a mensagem sempre que a viatura ou o oficial principal mudar
    viaturaInput?.addEventListener('input', updateCod0Message);
    oficialPrincipalInput?.addEventListener('input', updateCod0Message);

    // Gera a mensagem inicial
    updateCod0Message();
}