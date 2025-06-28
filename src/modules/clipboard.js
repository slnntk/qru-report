/**
 * @file Gerencia a funcionalidade de copiar para a área de transferência.
 */

export function initClipboard() {
    document.querySelectorAll(".copy-button").forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.copyTarget;
            const textToCopy = document.getElementById(targetId).innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalIcon = button.innerHTML;
                button.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => { button.innerHTML = originalIcon; }, 2000);
            });
        });
    });
}