/**
 * @file Fornece uma funcionalidade de autocompletar reutilizável.
 */

export function setupAutocomplete(inputElement, dataList, onSelectCallback) {
    const suggestionsContainer = inputElement.nextElementSibling;
    let activeSuggestionIndex = -1;

    inputElement.addEventListener("input", function() {
        const value = this.value;
        suggestionsContainer.innerHTML = "";
        if (!value) {
            suggestionsContainer.style.display = "none";
            return;
        }

        const filtered = dataList.filter(item => item.toLowerCase().includes(value.toLowerCase()));

        if (filtered.length > 0) {
            suggestionsContainer.style.display = "block";
            filtered.forEach(item => {
                const suggestionDiv = document.createElement("div");
                suggestionDiv.innerHTML = item.replace(new RegExp(`(${value})`, "gi"), "<strong>$1</strong>");
                suggestionDiv.addEventListener("click", () => {
                    inputElement.value = item;
                    suggestionsContainer.style.display = "none";
                    if (typeof onSelectCallback === 'function') onSelectCallback();
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
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeSuggestionIndex > -1) suggestions[activeSuggestionIndex].click();
        } else if (e.key === "Escape") {
            suggestionsContainer.style.display = "none";
        }

        suggestions.forEach((div, index) => div.classList.toggle("active", index === activeSuggestionIndex));
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
            suggestionsContainer.style.display = "none";
        }
    });
}