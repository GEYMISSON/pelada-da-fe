// ==========================
// MENU LATERAL
// ==========================

const sidebar = document.querySelector(".sidebar");
const menuBtn = document.getElementById("menu-btn");

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}

// ==========================
// RELÓGIO
// ==========================

function atualizarRelogio() {

    const agora = new Date();

    const texto =
        agora.toLocaleDateString("pt-BR") +
        " • " +
        agora.toLocaleTimeString("pt-BR");

    const relogio = document.getElementById("relogio");

    if (relogio) {

        relogio.textContent = texto;

    }

}

setInterval(atualizarRelogio, 1000);

atualizarRelogio();

// ==========================
// CARREGAR PÁGINAS
// ==========================

async function carregarPagina(nome) {

    try {

        const resposta = await fetch(`views/${nome}.html`);

        const html = await resposta.text();

        document.getElementById("conteudo").innerHTML = html;

        document.getElementById("tituloPagina").innerText =
            nome.charAt(0).toUpperCase() + nome.slice(1);

    } catch (erro) {

        document.getElementById("conteudo").innerHTML = `
            <div class="alert alert-danger mt-3">
                Erro ao carregar a página.
            </div>
        `;

        console.error(erro);

    }

}

// ==========================
// MENU
// ==========================

document.querySelectorAll(".menu a").forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        carregarPagina(link.dataset.page);

    });

});

// ==========================
// PRIMEIRA TELA
// ==========================

carregarPagina("dashboard");