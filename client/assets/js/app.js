// ==========================
// MENU LATERAL
// ==========================

const sidebar = document.querySelector(".sidebar");
const menuBtn = document.getElementById("menu-btn");

if (menuBtn && sidebar) {

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
// CARREGAR SCRIPT DA PÁGINA
// ==========================

function carregarScriptPagina(nome) {

    return new Promise((resolve, reject) => {

        const scriptExistente =
            document.getElementById("pagina-script");

        if (scriptExistente) {

            scriptExistente.remove();

        }

        const script = document.createElement("script");

        script.id = "pagina-script";

        script.src = `assets/js/modules/${nome}.js`;

        script.onload = resolve;

        script.onerror = reject;

        document.body.appendChild(script);

    });

}


// ==========================
// CARREGAR SERVIÇOS DA PÁGINA
// ==========================

function carregarServicePagina(nome) {

    return new Promise((resolve, reject) => {

        const serviceId = `service-${nome}`;

        const serviceExistente =
            document.getElementById(serviceId);

        if (serviceExistente) {

            resolve();

            return;

        }

        const script = document.createElement("script");

        script.id = serviceId;

        script.src = `assets/js/services/${nome}Service.js`;

        script.onload = resolve;

        script.onerror = reject;

        document.body.appendChild(script);

    });

}


// ==========================
// CARREGAR PÁGINAS
// ==========================

async function carregarPagina(nome) {

    try {

        const resposta =
            await fetch(`views/${nome}.html`);

        if (!resposta.ok) {

            throw new Error(
                `Não foi possível carregar a página: ${nome}`
            );

        }

        const html = await resposta.text();

        const conteudo =
            document.getElementById("conteudo");

        if (!conteudo) {

            throw new Error(
                "Elemento #conteudo não encontrado."
            );

        }

        conteudo.innerHTML = html;


        // ==========================
        // SERVIÇOS
        // ==========================

        if (nome === "jogadores") {

            await carregarServicePagina("jogador");

        }


        // ==========================
        // MÓDULO DA PÁGINA
        // ==========================

        try {

            await carregarScriptPagina(nome);

        } catch (erroScript) {

            console.warn(
                `Nenhum módulo JavaScript encontrado para "${nome}".`
            );

        }


        // ==========================
        // TÍTULO
        // ==========================

        const titulo =
            document.getElementById("tituloPagina");

        if (titulo) {

            titulo.innerText =
                nome.charAt(0).toUpperCase() +
                nome.slice(1);

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar página:",
            erro
        );

        const conteudo =
            document.getElementById("conteudo");

        if (conteudo) {

            conteudo.innerHTML = `
                <div class="alert alert-danger mt-3">
                    <strong>Erro ao carregar a página.</strong>
                    <br>
                    Verifique o console do navegador.
                </div>
            `;

        }

    }

}


// ==========================
// MENU
// ==========================

document.querySelectorAll(".menu a").forEach(link => {

    link.addEventListener("click", evento => {

        evento.preventDefault();

        const pagina =
            link.dataset.page;

        if (!pagina) {

            return;

        }

        carregarPagina(pagina);

    });

});


// ==========================
// PRIMEIRA TELA
// ==========================

carregarPagina("dashboard");