/**
 * @file Gerencia todos os templates de texto dinâmicos, alinhado com a estrutura de multi-seleção.
 */

// --- Função Auxiliar ---
const getArtigo = (qth) => {
    if (!qth) return 'de'; // Retorna 'de' se o QTH for nulo ou vazio.
    return qth.trim().split(" ").pop().toLowerCase().endsWith('a') ? "da" : "do";
};

// --- Funções de Geração de Template ---

function updateCpIniciarTemplate(config) {
    const { nomeCompleto, badge, isAltoComando, selectedGroups, cargos } = config;
    const extras = [];

    if (isAltoComando) {
        extras.push("Membro do Alto Comando");
    }

    if (selectedGroups && selectedGroups.length > 0) {
        selectedGroups.forEach(groupKey => {
            if (cargos[groupKey]) {
                extras.push(cargos[groupKey]);
            }
        });
    }

    let template = `QAP Central, ${nomeCompleto || '[NOME]'} (${badge || '[BADGE]'})`;
    if (extras.length > 0) {
        template += `, ${extras.join(", ")}`;
    }
    template += ", iniciando expediente pelo 1º BPM-AP.";

    const target = document.getElementById("template-cp-iniciar");
    if (target) target.innerText = template;
}

function updateCpFinalizarTemplate(config) {
    const { nomeCompleto, badge } = config;
    const target = document.getElementById("template-cp-finalizar");
    if (target) target.innerText = `QAP Central, ${nomeCompleto || '[NOME]'} (${badge || '[BADGE]'}), finalizando expediente pelo 1º BPM-AP. Boa patrulha a todos.`;
}

/**
 * ATUALIZADO: A função agora usa o template de solicitação de vaga corrigido.
 */
function updateCpVagaTemplate(config) {
    const { nomeCompleto, badge } = config;
    const target = document.getElementById("template-cp-vaga");
    // CORREÇÃO APLICADA AQUI
    if (target) target.innerText = `QAP Central, ${nomeCompleto || '[NOME]'} (${badge || '[BADGE]'}) no QAP. Alguma unidade com vaga ou algum oficial sem PTR para composição e início de Código 0?`;
}

function updateCpBoTemplate() {
    const veiculo = document.getElementById("cp-bo-veiculo")?.value || "[VEÍCULO]";
    const target = document.getElementById("template-cp-bo");
    if (target) target.innerText = `QAP Central, qual o número do B.O da QRU do ${veiculo}?`;
}

function updateRadioTemplate() {
    const viatura = document.getElementById("cod0-viatura")?.value || "[VIATURA]";
    const veiculo = document.getElementById("radio-veiculo")?.value || "[VEÍCULO]";
    const cor = document.getElementById("radio-cor")?.value || "[COR]";
    const qru = document.getElementById("radio-qru")?.value || "[QRU]";
    const qth = document.getElementById("radio-qth")?.value || "[QTH]";
    const numero = document.getElementById("radio-qrr-numero")?.value || "[NÚMERO]";
    const preferencia = document.getElementById("radio-qrr-preferencia")?.value || "[TIPO DE UNIDADE]";
    const target = document.getElementById("template-radio");
    if (target) target.innerText = `QAP Central, ${viatura} iniciando acompanhamento a um ${veiculo} ${cor}, da QRU de ${qru}, no QTH ${getArtigo(qth)} ${qth}, necessito do QRR de mais ${numero} unidades, preferência ${preferencia}.`;
}

function updateMecanicaCall(config) {
    const { nomeCompleto, badge, passaporte } = config;
    const qth = document.getElementById("mecanica-qth")?.value || "[LOCALIZAÇÃO]";
    const target = document.getElementById("mecanica-output");
    if (target) target.innerText = `Solicito apoio mecânico no QTH ${getArtigo(qth)} ${qth} para encaminhar um veículo até a DP-G. Att. #${badge || '[BADGE]'} ${nomeCompleto || '[NOME]'} | ${passaporte || '[PASSAPORTE]'}`;
}

function updateHospitalCall(config) {
    const { nomeCompleto, badge, passaporte } = config;
    const qth = document.getElementById("hospital-qth")?.value || "[LOCALIZAÇÃO]";
    const ocorrencia = document.getElementById("hospital-ocorrencia")?.value || "[OCORRÊNCIA]";
    const target = document.getElementById("hospital-output");
    if (target) target.innerText = `Solicito apoio médico no QTH ${getArtigo(qth)} ${qth} para reanimação de indivíduos envolvidos em ${ocorrencia}. Att. #${badge || '[BADGE]'} ${nomeCompleto || '[NOME]'} | ${passaporte || '[PASSAPORTE]'}`;
}

function update911_1() {
    const nomeCivil = document.getElementById("911-nome-civil")?.value || "[NOME DO CIVIL]";
    const target = document.getElementById("911-1-output");
    if (target) target.innerText = `Sr. ${nomeCivil}, encontra-se na cidade? Favor responder através do 911 (1/3).`;
}

function update911_2() {
    const local = document.getElementById("911-local")?.value || "[LOCAL]";
    const target = document.getElementById("911-2-output");
    if (target) target.innerText = `Seu veículo se encontra parado de forma irregular no ${local}, favor comparecer no local do mesmo, obrigado!`;
}

// --- Função "Mestra" de Atualização ---
export function updateAllTemplates(config) {
    updateCpIniciarTemplate(config);
    updateCpFinalizarTemplate(config);
    updateCpVagaTemplate(config);
    updateMecanicaCall(config);
    updateHospitalCall(config);
    updateCpBoTemplate();
    updateRadioTemplate();
    update911_1();
    update911_2();
}