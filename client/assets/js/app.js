const menu = document.querySelector(".sidebar");
const botao = document.getElementById("menu-btn");

if (botao) {
    botao.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}

// Relógio
function atualizarRelogio() {
    const agora = new Date();

    const relogio = document.getElementById("relogio");

    if (relogio) {
        relogio.innerHTML =
            agora.toLocaleDateString("pt-BR") +
            " - " +
            agora.toLocaleTimeString("pt-BR");
    }
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// Carregar telas
async function carregarPagina(nomePagina) {

    const resposta = await fetch(`views/${nomePagina}.html`);

    const html = await resposta.text();

    document.getElementById("conteudo").innerHTML = html;
}

// Dashboard inicial
carregarPagina("dashboard");

// Menu
document.querySelectorAll(".menu a").forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        const pagina = link.dataset.page;

        carregarPagina(pagina);

    });

});