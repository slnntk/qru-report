/**
 * @file relatorio.js
 * @description Controla toda a lógica do lado do cliente para a ferramenta de geração de relatórios e penas,
 * incluindo o processamento do formulário, cálculos de pena e interações da UI.
 */

// Garante que o script só seja executado após o DOM ser completamente carregado e analisado.
document.addEventListener("DOMContentLoaded", () => {

    /**
     * Inicializador principal da aplicação.
     * Encapsula toda a lógica para garantir que ela só execute após os pontos de referência serem carregados.
     * @param {string[]} pontosDeReferencia - Um array com nomes de locais para o autocompletar.
     */
    function initializeApp(pontosDeReferencia) {

        // --- Gerenciamento de Estado da UI ---

        // Controla o estado da barra lateral retrátil.
        const sidebar = document.getElementById("sidebar");
        document.getElementById("open_btn").addEventListener("click", () => sidebar.classList.toggle("open-sidebar"));

        // Gerencia a persistência do tema (claro/escuro) usando o localStorage.
        const toggleBtn = document.getElementById("toggle-dark");
        if (localStorage.getItem("theme") === "dark") {
            document.documentElement.classList.add("dark-mode");
        }
        toggleBtn.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark-mode");
            localStorage.setItem("theme", document.documentElement.classList.contains("dark-mode") ? "dark" : "light");
        });

        // --- Lógica Principal da Aplicação ---

        const form = document.getElementById("unified-form");
        const resultsArea = document.getElementById("results-area");
        const clearBtn = document.getElementById("clear-form-btn");

        // Listener de evento principal para a submissão do formulário.
        // Orquestra a coleta de dados, os cálculos e a renderização dos resultados.
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Impede o comportamento padrão de submissão do formulário.

            // Coleta e normaliza os dados dos campos do formulário.
            const qruType = document.getElementById("qru_type").value;
            const startLoc = document.getElementById("qru_location_start").value;
            const vehicle = document.getElementById("suspect_vehicle").value;
            const endLoc = document.getElementById("qru_location_end").value;

            const ferramentas = parseInt(document.getElementById("ferramentas").value) || 0;
            const entorpecentes = parseInt(document.getElementById("entorpecentes").value) || 0;
            const municao = parseInt(document.getElementById("municao").value) || 0;
            const dinheiro = parseInt(document.getElementById("dinheiro").value) || 0;
            const produtos = parseInt(document.getElementById("produtos").value) || 0;
            const multas = parseInt(document.getElementById("multas").value) || 0;

            // Lógica de negócio: Define as regras de cálculo da pena para cada infração.
            const penas = {
                "Ferramentas Ilícitas": ferramentas > 0 ? 10 + ferramentas * 10 : 0,
                "Entorpecentes": entorpecentes > 0 ? 15 + entorpecentes / 2 : 0,
                "Munição Ilegal": municao > 0 ? 15 + Math.floor(municao / 20) * 5 : 0,
                "Dinheiro Ilícito": dinheiro > 0 ? 10 + Math.floor(dinheiro / 1000) : 0,
                "Produtos Roubados": produtos > 0 ? 10 + (produtos - 1) * 2 : 0,
                "Multas Pendentes": multas > 0 ? 10 + Math.floor(multas / 1000) : 0,
            };

            // Formata uma string listando todos os itens apreendidos para o relatório.
            const itensApreendidos = Object.entries({ ferramentas, entorpecentes, municao, dinheiro, produtos, multas })
                .filter(([_, qtd]) => qtd > 0)
                .map(([crime, qtd]) => `${crime.charAt(0).toUpperCase() + crime.slice(1)}: ${qtd}`)
                .join(", ");

            // Gera o detalhamento da pena para o corpo principal do relatório.
            const penasDetalhadasRelatorio = Object.entries(penas)
                .filter(([_, meses]) => meses > 0)
                .map(([crime, meses]) => `- ${crime}: ${meses.toFixed(1)} meses`)
                .join("<br>");

            // Calcula a pena total somando todas as penas individuais.
            const penaTotal = Object.values(penas).reduce((acc, val) => acc + val, 0);

            // Constrói a string final do relatório, usando template literal para legibilidade.
            const relato = `🛡️ <strong>1º Batalhão de Polícia Militar - Cidade Alta (1ºBPM-AV)</strong> 🛡️<br><br>` +
                `📝 <strong>Relato:</strong> Recebemos uma denúncia (via central), de uma QRU de ${qruType || "[NÃO INFORMADO]"} na região do ${startLoc || "[NÃO INFORMADO]"}. Ao se deslocar para o referido local, encontramos o(s) requerente(s) cometendo o(s) referido(s) delito(s). Após aviso sonoro, luminoso e verbal, o indivíduo empreendeu fuga. Minutos depois, o mesmo ficou inoperante em seu veículo ${vehicle || "[NÃO INFORMADO]"}, na região do ${endLoc || "[NÃO INFORMADO]"}. Iniciou tentativa de fuga a pé, porém foi capturado e conduzido até o departamento policial para prisão.<br><br>` +
                `📦 <strong>Itens apreendidos:</strong> ${itensApreendidos || "Nenhum"}<br><br>` +
                `⚖️ <strong>Detalhamento da Pena:</strong><br>${penasDetalhadasRelatorio || "Nenhuma pena aplicada."}<br><br>` +
                `<strong>Pena Total:</strong> ${penaTotal.toFixed(1)} meses`;

            // Renderiza o relatório e os detalhes da pena gerados no DOM.
            document.getElementById("relato-output").innerHTML = relato;

            const penaDetalhadaHtml = Object.entries(penas)
                .filter(([_, meses]) => meses > 0)
                .map(([crime, meses]) => `<div class="linha"><span>${crime}:</span><span>${meses.toFixed(1)} meses</span></div>`)
                .join("");

            document.getElementById("pena-detalhada-output").innerHTML = penaDetalhadaHtml || "<p>Nenhuma pena a ser detalhada.</p>";
            document.getElementById("pena-total-output").textContent = `${penaTotal.toFixed(1)} meses`;

            // Exibe a seção de resultados.
            resultsArea.style.display = "block";
        });

        // Listener de evento para o botão de limpar, resetando o formulário e ocultando os resultados.
        clearBtn.addEventListener("click", () => {
            form.reset();
            resultsArea.style.display = "none";
        });

        // --- Lógica dos Componentes da UI ---

        // Gerencia a interface de abas para alternar entre as visualizações de relatório e detalhes.
        const tabButtons = document.querySelectorAll(".tab-button");
        const tabContents = document.querySelectorAll(".tab-content");
        tabButtons.forEach(button => {
            button.addEventListener("click", () => {
                tabButtons.forEach(btn => btn.classList.remove("active"));
                tabContents.forEach(content => content.classList.remove("active"));
                button.classList.add("active");
                document.getElementById(button.dataset.tab).classList.add("active");
            });
        });

        // Controla a funcionalidade de 'copiar para a área de transferência' com feedback visual.
        const copyBtn = document.getElementById("copy-report-btn");
        copyBtn.addEventListener("click", () => {
            // Usa a API navigator.clipboard para uma cópia segura e moderna.
            navigator.clipboard.writeText(document.getElementById("relato-output").innerText).then(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                }, 2000);
            });
        });

        /**
         * Função 'factory' que adiciona o comportamento de autocompletar a um campo de texto.
         * @param {HTMLInputElement} inputElement O campo de input ao qual o comportamento será anexado.
         */
        function setupAutocomplete(inputElement) {
            const suggestionsContainer = inputElement.nextElementSibling;
            let activeSuggestionIndex = -1;

            // Filtra e exibe sugestões com base na entrada do usuário.
            inputElement.addEventListener("input", function() {
                const value = this.value;
                suggestionsContainer.innerHTML = "";
                if (!value) {
                    suggestionsContainer.style.display = "none";
                    return;
                }

                const filteredSuggestions = pontosDeReferencia.filter(item =>
                    item.toLowerCase().includes(value.toLowerCase())
                );

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
                        });
                        suggestionsContainer.appendChild(suggestionDiv);
                    });
                } else {
                    suggestionsContainer.style.display = "none";
                }
                activeSuggestionIndex = -1;
            });

            // Controla a navegação por teclado (setas, enter, escape) para acessibilidade.
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
        }

        // Fecha as sugestões de autocompletar ao clicar em qualquer outra parte da página.
        document.addEventListener("click", (e) => {
            document.querySelectorAll('.autocomplete-suggestions').forEach(container => {
                if (!container.parentElement.contains(e.target)) {
                    container.innerHTML = "";
                    container.style.display = "none";
                }
            });
        });

        // Instancia o autocompletar nos campos de localização relevantes.
        const startLocInput = document.getElementById("qru_location_start");
        const endLocInput = document.getElementById("qru_location_end");

        setupAutocomplete(startLocInput);
        setupAutocomplete(endLocInput);
    }

    // --- Busca de Dados ---

    // Carrega os pontos de referência de forma assíncrona a partir do arquivo JSON.
    // Esta abordagem mantém os dados separados da lógica, melhorando a manutenção.
    fetch('pontos_referencia.json')
        .then(response => {
            if (!response.ok) {
                // Lida com casos onde o arquivo pode não existir ou ocorrer um erro de rede.
                throw new Error('A resposta da rede não foi bem-sucedida');
            }
            return response.json();
        })
        .then(data => {
            // Após os dados serem carregados com sucesso, inicializa a aplicação principal.
            initializeApp(data.sort());
        })
        .catch(error => {
            // Tratamento de erro 'graceful' caso a busca falhe.
            // A aplicação ainda pode funcionar, embora sem a funcionalidade de autocompletar.
            console.error('Houve um problema ao carregar os pontos de referência:', error);
            initializeApp([]); // Inicializa com um array vazio para evitar que a aplicação quebre.
        });
});