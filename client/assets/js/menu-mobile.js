
(() => {
    "use strict";

    const sidebar = document.querySelector(".sidebar");
    const botaoMenu = document.getElementById("menu-btn");

    if (!sidebar || !botaoMenu) {
        console.warn(
            "Menu mobile: sidebar ou botão do menu não encontrado."
        );
        return;
    }

    // Evita inicialização duplicada.
    if (window.PeladaDaFeMenuMobile) {
        return;
    }

    const seletorMobile = window.matchMedia("(max-width: 900px)");

    // --------------------------------------------------
    // CRIAR O FUNDO ESCURECIDO
    // --------------------------------------------------

    let overlay = document.getElementById("menu-mobile-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "menu-mobile-overlay";
        overlay.className = "menu-mobile-overlay";
        overlay.setAttribute("aria-hidden", "true");

        document.body.appendChild(overlay);
    }

    // --------------------------------------------------
    // ATUALIZAR O ESTADO DO MENU
    // --------------------------------------------------

    function atualizarEstado() {
        const ehMobile = seletorMobile.matches;

        if (!ehMobile) {
            sidebar.classList.remove("active");
        }

        const aberto =
            ehMobile && sidebar.classList.contains("active");

        overlay.classList.toggle("visivel", aberto);
        document.body.classList.toggle(
            "menu-mobile-aberto",
            aberto
        );

        botaoMenu.setAttribute(
            "aria-expanded",
            String(aberto)
        );

        botaoMenu.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );

        overlay.setAttribute(
            "aria-hidden",
            String(!aberto)
        );
    }

    // --------------------------------------------------
    // BOTÃO DE ABRIR E FECHAR
    //
    // O app.js existente continua responsável por
    // alternar a classe "active".
    // --------------------------------------------------

    botaoMenu.addEventListener("click", () => {
        atualizarEstado();
    });

    // --------------------------------------------------
    // FECHAR AO CLICAR NO FUNDO
    // --------------------------------------------------

    overlay.addEventListener("click", fecharMenu);

    function fecharMenu() {
        sidebar.classList.remove("active");
        atualizarEstado();
    }

    // --------------------------------------------------
    // FECHAR AO ESCOLHER UMA TELA
    // --------------------------------------------------

    sidebar.addEventListener("click", (evento) => {
        const link = evento.target.closest("a[data-page]");

        if (!link || !seletorMobile.matches) {
            return;
        }

        fecharMenu();
    });

    // --------------------------------------------------
    // FECHAR COM A TECLA ESC
    // --------------------------------------------------

    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            sidebar.classList.contains("active")
        ) {
            fecharMenu();
        }
    });

    // --------------------------------------------------
    // AJUSTAR AO REDIMENSIONAR A TELA
    // --------------------------------------------------

    function aoMudarTamanho() {
        atualizarEstado();
    }

    if (typeof seletorMobile.addEventListener === "function") {
        seletorMobile.addEventListener(
            "change",
            aoMudarTamanho
        );
    } else {
        seletorMobile.addListener(aoMudarTamanho);
    }

    // Disponibiliza o fechamento para outros módulos.
    window.PeladaDaFeMenuMobile = {
        fechar: fecharMenu,
        atualizar: atualizarEstado
    };

    atualizarEstado();
})();