/**
 * @file relatorio.js
 * @description Controla a lógica do cliente para a ferramenta de relatórios.
 */

// A MUDANÇA MAIS IMPORTANTE ESTÁ AQUI:
// Importa os dados diretamente. O Vite vai garantir que este arquivo seja incluído no build.
// O './' é crucial para indicar que o arquivo está na mesma pasta.
import pontosDeReferenciaData from './pontos_referencia.json';

// Garante que o script só seja executado após o DOM ser completamente carregado.
document.addEventListener("DOMContentLoaded", () => {

    /**
     * Função principal que inicializa toda a lógica da página.
     * @param {string[]} pontosDeReferencia - O array de locais para o autocomplete.
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

        // --- Lógica Principal da Aplicação ---
        const form = document.getElementById("unified-form");
        const resultsArea = document.getElementById("results-area");
        const clearBtn = document.getElementById("clear-form-btn");

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            // ... (toda a sua lógica de cálculo de pena, que já está correta)
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
            const penas = {
                "Ferramentas Ilícitas": ferramentas > 0 ? 10 + ferramentas * 10 : 0,
                "Entorpecentes": entorpecentes > 0 ? 15 + entorpecentes / 2 : 0,
                "Munição Ilegal": municao > 0 ? 15 + Math.floor(municao / 20) * 5 : 0,
                "Dinheiro Ilícito": dinheiro > 0 ? 10 + Math.floor(dinheiro / 1000) : 0,
                "Produtos Roubados": produtos > 0 ? 10 + (produtos - 1) * 2 : 0,
                "Multas Pendentes": multas > 0 ? 10 + Math.floor(multas / 1000) : 0,
            };
            const itensApreendidos = Object.entries({ ferramentas, entorpecentes, municao, dinheiro, produtos, multas }).filter(([_, qtd]) => qtd > 0).map(([crime, qtd]) => `${crime.charAt(0).toUpperCase() + crime.slice(1)}: ${qtd}`).join(", ");
            const penasDetalhadasRelatorio = Object.entries(penas).filter(([_, meses]) => meses > 0).map(([crime, meses]) => `- ${crime}: ${meses.toFixed(1)} meses`).join("<br>");
            const penaTotal = Object.values(penas).reduce((acc, val) => acc + val, 0);
            const relato = `🛡️ <strong>1º Batalhão de Polícia Militar - Cidade Alta (1ºBPM-AV)</strong> 🛡️<br><br>` + `📝 <strong>Relato:</strong> Recebemos uma denúncia (via central), de uma QRU de ${qruType || "[NÃO INFORMADO]"} na região do ${startLoc || "[NÃO INFORMADO]"}. Ao se deslocar para o referido local, encontramos o(s) requerente(s) cometendo o(s) referido(s) delito(s). Após aviso sonoro, luminoso e verbal, o indivíduo empreendeu fuga. Minutos depois, o mesmo ficou inoperante em seu veículo ${vehicle || "[NÃO INFORMADO]"}, na região do ${endLoc || "[NÃO INFORMADO]"}. Iniciou tentativa de fuga a pé, porém foi capturado e conduzido até o departamento policial para prisão.<br><br>` + `📦 <strong>Itens apreendidos:</strong> ${itensApreendidos || "Nenhum"}<br><br>` + `⚖️ <strong>Detalhamento da Pena:</strong><br>${penasDetalhadasRelatorio || "Nenhuma pena aplicada."}<br><br>` + `<strong>Pena Total:</strong> ${penaTotal.toFixed(1)} meses`;
            document.getElementById("relato-output").innerHTML = relato;
            const penaDetalhadaHtml = Object.entries(penas).filter(([_, meses]) => meses > 0).map(([crime, meses]) => `<div class="linha"><span>${crime}:</span><span>${meses.toFixed(1)} meses</span></div>`).join("");
            document.getElementById("pena-detalhada-output").innerHTML = penaDetalhadaHtml || "<p>Nenhuma pena a ser detalhada.</p>";
            document.getElementById("pena-total-output").textContent = `${penaTotal.toFixed(1)} meses`;
            resultsArea.style.display = "block";
        });

        clearBtn.addEventListener("click", () => {
            form.reset();
            resultsArea.style.display = "none";
        });

        // ... (resto do seu código, como tabs, copy button, etc.)
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
        const copyBtn = document.getElementById("copy-report-btn");
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(document.getElementById("relato-output").innerText).then(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
                }, 2000);
            });
        });

        // --- Lógica do Autocomplete ---
        function setupAutocomplete(inputElement) {
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
        }
        document.addEventListener("click", (e) => {
            document.querySelectorAll('.autocomplete-suggestions').forEach(container => {
                if (!container.parentElement.contains(e.target)) {
                    container.innerHTML = "";
                    container.style.display = "none";
                }
            });
        });
        const startLocInput = document.getElementById("qru_location_start");
        const endLocInput = document.getElementById("qru_location_end");
        setupAutocomplete(startLocInput);
        setupAutocomplete(endLocInput);
    }

    // --- PONTO DE ENTRADA DA APLICAÇÃO ---
    // Como importamos os dados, eles já estão disponíveis.
    // Simplesmente ordenamos e inicializamos a aplicação.
    initializeApp(pontosDeReferenciaData.sort());
});