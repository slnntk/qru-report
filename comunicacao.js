/**
 * @file comunicacao.js
 * @description Gerencia a lógica da página de Comunicação, incluindo personalização de templates,
 * geradores de códigos e chamados, e interações de UI como acordeões e autocompletar.
 */

// A SOLUÇÃO ESTÁ AQUI: Importamos os dados diretamente, assim como fizemos no relatorio.js
import pontosDeReferenciaData from './pontos_referencia.json';

// Garante que o script só seja executado após o DOM ser completamente carregado.
document.addEventListener("DOMContentLoaded", () => {

    /**
     * Inicializador principal da aplicação de comunicação.
     * @param {string[]} pontosDeReferencia - Array com nomes de locais para o autocompletar.
     */
    function initializeApp(pontosDeReferencia) {

        // --- Gerenciamento de Estado da UI ---

        const sidebar = document.getElementById("sidebar");
        document.getElementById("open_btn").addEventListener("click", () => sidebar.classList.toggle("open-sidebar"));

        const toggleBtn = document.getElementById("toggle-dark");
        if (localStorage.getItem("theme") === "dark") {
            document.documentElement.classList.add("dark-mode");
        }
        toggleBtn.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark-mode");
            localStorage.setItem("theme", document.documentElement.classList.contains("dark-mode") ? "dark" : "light");
        });

        // --- Personalização Dinâmica ---
        const userNomeInput = document.getElementById("user-nome");
        const userBadgeInput = document.getElementById("user-badge");
        const userPassaporteInput = document.getElementById("user-passaporte");

        function updateAllDynamicTemplates() {
            updateTemplates();
            updateMecanicaCall();
            updateHospitalCall();
        }

        function updateTemplates() {
            const nomeCompleto = userNomeInput.value || "[PATENTE NOME]";
            const badge = userBadgeInput.value || "[BADGE]";
            const nome = nomeCompleto.split(' ').slice(1).join(' ') || nomeCompleto;
            document.getElementById("template-radio").innerText = `QAP Central, ${nome} (${badge}) iniciando acompanhamento a um [VEÍCULO] [COR], da QRU de [QRU], no QTH do [QTH], necessito do QRR de mais [NÚMERO] unidades, preferência [TIPO DE UNIDADE].`;
            document.getElementById("template-cp-vaga").innerText = `QAP Central, ${nomeCompleto} ${badge} no QAP. Alguma unidade com vaga ou algum oficial sem PTR para composição e início de Código 0?`;
        }

        [userNomeInput, userBadgeInput, userPassaporteInput].forEach(input => {
            input.addEventListener("input", updateAllDynamicTemplates);
        });

        // --- Lógica do Acordeão ---
        document.querySelectorAll(".accordion-item").forEach(item => {
            const header = item.querySelector(".accordion-header");
            header.addEventListener("click", () => {
                const content = item.querySelector(".accordion-content");
                const isActive = item.classList.contains("active");
                document.querySelectorAll(".accordion-item").forEach(other => {
                    if (other !== item) {
                        other.classList.remove("active");
                        other.querySelector(".accordion-content").style.maxHeight = 0;
                    }
                });
                if (!isActive) {
                    item.classList.add("active");
                    content.style.maxHeight = content.scrollHeight + 400 + "px";
                } else {
                    item.classList.remove("active");
                    content.style.maxHeight = 0;
                }
            });
        });

        // --- Lógica do Gerador de COD 0 ---
        const tripulacaoList = document.getElementById("tripulacao-list");
        const addOficialBtn = document.getElementById("add-oficial-btn");
        const gerarCod0Btn = document.getElementById("gerar-cod0-btn");
        const cod0Results = document.getElementById("cod0-results");
        const cod0Output = document.getElementById("cod0-output");
        const viaturaInput = document.getElementById("cod0-viatura");
        const patentes = [ { nome: "Aluno", abrev: "AL", valor: 0 }, { nome: "Soldado 2ª Classe", abrev: "SD2", valor: 1 }, { nome: "Soldado 1ª Classe", abrev: "SD1", valor: 2 }, { nome: "Cabo", abrev: "CB", valor: 3 }, { nome: "Sargento", abrev: "SGT", valor: 4 }, { nome: "Tenente", abrev: "TEN", valor: 5 }, { nome: "Capitão", abrev: "CAP", valor: 6 }, { nome: "Major", abrev: "MAJ", valor: 7 }, { nome: "Coronel", abrev: "CEL", valor: 8 } ];
        const addOficial = (nome = "", patenteSelecionada = "Aluno") => {
            const oficialItem = document.createElement("div");
            oficialItem.className = "oficial-item";
            oficialItem.innerHTML = `<select class="oficial-patente">${patentes.map(p => `<option value="${p.nome}" ${p.nome === patenteSelecionada ? 'selected' : ''}>${p.nome}</option>`).join('')}</select><input type="text" class="oficial-nome" placeholder="Nome do Oficial" value="${nome}"><button class="remove-oficial-btn secondary-button"><i class="fa-solid fa-trash"></i></button>`;
            tripulacaoList.appendChild(oficialItem);
            oficialItem.querySelector(".remove-oficial-btn").addEventListener("click", () => oficialItem.remove());
        };
        addOficialBtn.addEventListener("click", () => addOficial());
        gerarCod0Btn.addEventListener("click", () => {
            const viatura = viaturaInput.value || "[VIATURA]";
            const oficiais = Array.from(document.querySelectorAll(".oficial-item")).map(item => {
                const patenteNome = item.querySelector(".oficial-patente").value;
                const patenteInfo = patentes.find(p => p.nome === patenteNome);
                return { nome: item.querySelector(".oficial-nome").value.trim() || "[NOME]", patente: patenteInfo.abrev, valor: patenteInfo.valor };
            }).filter(o => o.nome !== "[NOME]");
            oficiais.sort((a, b) => b.valor - a.valor);
            if (oficiais.length === 0) {
                cod0Output.innerText = "Adicione pelo menos um oficial à tripulação.";
                cod0Results.style.display = "block";
                return;
            }
            const nomesFormatados = oficiais.map(o => `${o.patente} ${o.nome}`);
            let tripulacaoTexto = nomesFormatados.length === 1 ? nomesFormatados[0] : `${nomesFormatados.slice(0, -1).join(", ")} e ${nomesFormatados.slice(-1)[0]}`;
            cod0Output.innerText = `QAP Central, viatura ${viatura} iniciando patrulhamento em COD 0. Tripulada pelo ${tripulacaoTexto}.`;
            cod0Results.style.display = "block";
        });

        // --- Lógica dos Chamados (Abas e Atualização em Tempo Real) ---
        const subTabButtons = document.querySelectorAll(".sub-tab-button");
        const subTabContents = document.querySelectorAll(".sub-tab-content");
        subTabButtons.forEach(button => {
            button.addEventListener("click", () => {
                subTabButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                subTabContents.forEach(content => content.classList.remove("active"));
                document.getElementById(button.dataset.tab).classList.add("active");
            });
        });

        const getArtigo = (qth) => {
            const ultimaPalavra = qth.trim().split(" ").pop().toLowerCase();
            return ultimaPalavra.endsWith('a') ? "da" : "do";
        };
        const mecanicaQthInput = document.getElementById("mecanica-qth");
        const mecanicaOutput = document.getElementById("mecanica-output");
        const hospitalQthInput = document.getElementById("hospital-qth");
        const hospitalOcorrenciaInput = document.getElementById("hospital-ocorrencia");
        const hospitalOutput = document.getElementById("hospital-output");

        function updateMecanicaCall() {
            const qth = mecanicaQthInput.value.trim() || "[LOCALIZAÇÃO]";
            const nomeCompleto = userNomeInput.value || "[PATENTE NOME]";
            const badge = userBadgeInput.value || "[BADGE]";
            const passaporte = userPassaporteInput.value || "[PASSAPORTE]";
            mecanicaOutput.innerText = `Solicito apoio mecânico no QTH ${getArtigo(qth)} ${qth} para encaminhar um veículo até a DP-G. Att. #${badge} ${nomeCompleto} | ${passaporte}`;
        }
        function updateHospitalCall() {
            const qth = hospitalQthInput.value.trim() || "[LOCALIZAÇÃO]";
            const ocorrencia = hospitalOcorrenciaInput.value.trim() || "[OCORRÊNCIA]";
            const nomeCompleto = userNomeInput.value || "[PATENTE NOME]";
            const badge = userBadgeInput.value || "[BADGE]";
            const passaporte = userPassaporteInput.value || "[PASSAPORTE]";
            hospitalOutput.innerText = `Solicito apoio médico no QTH ${getArtigo(qth)} ${qth} para reanimação de indivíduos envolvidos em ${ocorrencia}. Att. #${badge} ${nomeCompleto} | ${passaporte}`;
        }
        mecanicaQthInput.addEventListener("input", updateMecanicaCall);
        hospitalQthInput.addEventListener("input", updateHospitalCall);
        hospitalOcorrenciaInput.addEventListener("input", updateHospitalCall);

        // --- Lógica dos Geradores /911 ---
        const nomeCivilInput = document.getElementById("911-nome-civil");
        const output911_1 = document.getElementById("911-1-output");
        const localInput = document.getElementById("911-local");
        const output911_2 = document.getElementById("911-2-output");
        function update911_1() {
            const nomeCivil = nomeCivilInput.value.trim() || "[NOME DO CIVIL]";
            output911_1.innerText = `Sr. ${nomeCivil}, encontra-se na cidade? Favor responder através do 911 (1/3).`;
        }
        function update911_2() {
            const local = localInput.value.trim() || "[LOCAL]";
            output911_2.innerText = `Seu veículo se encontra parado de forma irregular no ${local}, favor comparecer no local do mesmo, obrigado!`;
        }
        nomeCivilInput.addEventListener("input", update911_1);
        localInput.addEventListener("input", update911_2);

        // --- Lógica do Gerador de CP B.O. ---
        const cpBoVeiculoInput = document.getElementById("cp-bo-veiculo");
        const cpBoOutput = document.getElementById("template-cp-bo");
        function updateCpBo() {
            const veiculo = cpBoVeiculoInput.value.trim() || "[VEÍCULO]";
            cpBoOutput.innerText = `QAP Central, qual o número do B.O da QRU do ${veiculo}?`;
        }
        cpBoVeiculoInput.addEventListener("input", updateCpBo);

        // --- Lógica de Autocompletar (Reutilizável) ---
        function setupAutocomplete(inputElement, onSelectCallback) {
            const suggestionsContainer = inputElement.nextElementSibling;
            let activeSuggestionIndex = -1;
            inputElement.addEventListener("input", function() {
                const value = this.value;
                suggestionsContainer.innerHTML = "";
                if (!value) {
                    suggestionsContainer.style.display = "none";
                    return;
                }
                const filteredSuggestions = pontosDeReferencia.filter(item => item.toLowerCase().includes(value.toLowerCase()));
                if (filteredSuggestions.length > 0) {
                    suggestionsContainer.style.display = "block";
                    filteredSuggestions.forEach(item => {
                        const suggestionDiv = document.createElement("div");
                        const regex = new RegExp(`(${value})`, "gi");
                        suggestionDiv.innerHTML = item.replace(regex, "<strong>$1</strong>");
                        suggestionDiv.addEventListener("click", () => {
                            inputElement.value = item;
                            suggestionsContainer.innerHTML = "";
                            suggestionsContainer.style.display = "none";
                            onSelectCallback();
                        });
                        suggestionsContainer.appendChild(suggestionDiv);
                    });
                } else {
                    suggestionsContainer.style.display = "none";
                }
                activeSuggestionIndex = -1;
            });
            inputElement.addEventListener("keydown", function(e) {
                const suggestions = suggestionsContainer.querySelectorAll("div");
                if (suggestions.length === 0) return;
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
                    updateActiveSuggestion(suggestions);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
                    updateActiveSuggestion(suggestions);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (activeSuggestionIndex > -1) {
                        suggestions[activeSuggestionIndex].click();
                    }
                } else if (e.key === "Escape") {
                    suggestionsContainer.innerHTML = "";
                    suggestionsContainer.style.display = "none";
                }
            });
            function updateActiveSuggestion(suggestions) {
                suggestions.forEach((div, index) => {
                    div.classList.toggle("active", index === activeSuggestionIndex);
                });
            }
            document.addEventListener("click", (e) => {
                if (e.target.closest('.autocomplete-wrapper') === null) {
                    suggestionsContainer.innerHTML = "";
                    suggestionsContainer.style.display = "none";
                }
            });
        }

        setupAutocomplete(mecanicaQthInput, updateMecanicaCall);
        setupAutocomplete(hospitalQthInput, updateHospitalCall);
        setupAutocomplete(localInput, update911_2);

        // --- Lógica de Copiar (Universal) ---
        document.querySelectorAll(".copy-button").forEach(button => {
            button.addEventListener("click", () => {
                const targetId = button.dataset.copyTarget;
                const textToCopy = document.getElementById(targetId).innerText;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalIcon = button.innerHTML;
                    button.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => {
                        button.innerHTML = originalIcon;
                    }, 2000);
                });
            });
        });

        // --- Inicialização ---
        updateAllDynamicTemplates();
        addOficial(userNomeInput.value.split(' ').slice(1).join(' '), "Aluno");
        update911_1();
        update911_2();
        updateCpBo();
        updateMecanicaCall();
        updateHospitalCall();
    }

    // --- PONTO DE ENTRADA DA APLICAÇÃO ---
    // Removemos o 'fetch' e inicializamos o app diretamente com os dados importados.
    initializeApp(pontosDeReferenciaData.sort());
});