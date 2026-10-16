(function () {
    "use strict";

    const CHAVE_LOCAL = "peladaDaFeConfiguracoes";
    const URL_API = "/api/configuracoes";

    let revisaoTema = 0;

    const ESTILOS_TEMA = `
        html[data-tema-aparencia="escuro"] {
            color-scheme: dark;
            --pf-bg: #111827;
            --pf-surface: #1f2937;
            --pf-surface-alt: #273449;
            --pf-text: #e5e7eb;
            --pf-muted: #aab5c5;
            --pf-border: #374151;
            --pf-input: #111827;
            --pf-link: #86b7fe;
        }

        html[data-tema-aparencia="escuro"] body,
        html[data-tema-aparencia="escuro"] .wrapper,
        html[data-tema-aparencia="escuro"] .content,
        html[data-tema-aparencia="escuro"] #conteudo {
            background: var(--pf-bg) !important;
            color: var(--pf-text) !important;
        }

        html[data-tema-aparencia="escuro"] .topbar,
        html[data-tema-aparencia="escuro"] .card,
        html[data-tema-aparencia="escuro"] .card-header.bg-white,
        html[data-tema-aparencia="escuro"] .card-footer,
        html[data-tema-aparencia="escuro"] .card-box,
        html[data-tema-aparencia="escuro"] .conteudo,
        html[data-tema-aparencia="escuro"] .modal-content,
        html[data-tema-aparencia="escuro"] .dropdown-menu,
        html[data-tema-aparencia="escuro"] .list-group-item,
        html[data-tema-aparencia="escuro"] .accordion-item,
        html[data-tema-aparencia="escuro"] .popover,
        html[data-tema-aparencia="escuro"] .offcanvas {
            background: var(--pf-surface) !important;
            color: var(--pf-text) !important;
            border-color: var(--pf-border) !important;
        }

        html[data-tema-aparencia="escuro"] .bg-white,
        html[data-tema-aparencia="escuro"] .bg-light,
        html[data-tema-aparencia="escuro"] .accordion-button,
        html[data-tema-aparencia="escuro"] .accordion-button:not(.collapsed) {
            background: var(--pf-surface) !important;
            color: var(--pf-text) !important;
        }

        html[data-tema-aparencia="escuro"] .text-dark,
        html[data-tema-aparencia="escuro"] .text-body,
        html[data-tema-aparencia="escuro"] h1,
        html[data-tema-aparencia="escuro"] h2,
        html[data-tema-aparencia="escuro"] h3,
        html[data-tema-aparencia="escuro"] h4,
        html[data-tema-aparencia="escuro"] h5,
        html[data-tema-aparencia="escuro"] h6,
        html[data-tema-aparencia="escuro"] p,
        html[data-tema-aparencia="escuro"] label,
        html[data-tema-aparencia="escuro"] .form-label,
        html[data-tema-aparencia="escuro"] .form-check-label {
            color: var(--pf-text) !important;
        }

        html[data-tema-aparencia="escuro"] .text-muted,
        html[data-tema-aparencia="escuro"] .form-text,
        html[data-tema-aparencia="escuro"] small,
        html[data-tema-aparencia="escuro"] #relogio {
            color: var(--pf-muted) !important;
        }

        html[data-tema-aparencia="escuro"] .border,
        html[data-tema-aparencia="escuro"] .border-top,
        html[data-tema-aparencia="escuro"] .border-bottom,
        html[data-tema-aparencia="escuro"] .border-start,
        html[data-tema-aparencia="escuro"] .border-end,
        html[data-tema-aparencia="escuro"] hr {
            border-color: var(--pf-border) !important;
        }

        html[data-tema-aparencia="escuro"] .form-control,
        html[data-tema-aparencia="escuro"] .form-select,
        html[data-tema-aparencia="escuro"] .input-group-text,
        html[data-tema-aparencia="escuro"] .form-control:focus,
        html[data-tema-aparencia="escuro"] .form-select:focus {
            background: var(--pf-input) !important;
            color: var(--pf-text) !important;
            border-color: var(--pf-border) !important;
        }

        html[data-tema-aparencia="escuro"] .form-control::placeholder {
            color: #8b98aa !important;
        }

        html[data-tema-aparencia="escuro"] .table {
            --bs-table-color: var(--pf-text);
            --bs-table-bg: var(--pf-surface);
            --bs-table-border-color: var(--pf-border);
            --bs-table-striped-bg: var(--pf-surface-alt);
            --bs-table-striped-color: var(--pf-text);
            --bs-table-hover-bg: #334155;
            --bs-table-hover-color: #ffffff;
            color: var(--pf-text) !important;
            border-color: var(--pf-border) !important;
        }

        html[data-tema-aparencia="escuro"] .table > :not(caption) > * > *,
        html[data-tema-aparencia="escuro"] .table-light,
        html[data-tema-aparencia="escuro"] .table-light > * {
            background: var(--pf-surface) !important;
            color: var(--pf-text) !important;
            border-color: var(--pf-border) !important;
        }

        html[data-tema-aparencia="escuro"] .table-striped > tbody > tr:nth-of-type(odd) > *,
        html[data-tema-aparencia="escuro"] .table-hover > tbody > tr:hover > * {
            background: var(--pf-surface-alt) !important;
            color: var(--pf-text) !important;
        }

        html[data-tema-aparencia="escuro"] .content a:not(.btn),
        html[data-tema-aparencia="escuro"] #conteudo a:not(.btn) {
            color: var(--pf-link);
        }

        html[data-tema-aparencia="escuro"] .btn-outline-secondary {
            color: #d1d5db !important;
            border-color: #6b7280 !important;
        }

        html[data-tema-aparencia="escuro"] .btn-outline-secondary:hover {
            color: #ffffff !important;
            background: #374151 !important;
        }

        html[data-tema-aparencia="escuro"] .alert-info {
            color: #d8efff !important;
            background: #12364a !important;
            border-color: #20516c !important;
        }

        html[data-tema-aparencia="escuro"] .alert-success {
            color: #d5f5df !important;
            background: #123b2a !important;
            border-color: #246745 !important;
        }

        html[data-tema-aparencia="escuro"] .alert-warning {
            color: #fff0c2 !important;
            background: #493713 !important;
            border-color: #765a20 !important;
        }

        html[data-tema-aparencia="escuro"] .alert-danger {
            color: #ffdede !important;
            background: #4a1f26 !important;
            border-color: #7f303b !important;
        }

        html[data-tema-aparencia="escuro"] .badge.bg-warning,
        html[data-tema-aparencia="escuro"] .badge.bg-warning .text-dark {
            color: #212529 !important;
        }

        html[data-tema-aparencia="escuro"] .topbar {
            box-shadow: 0 2px 8px rgba(0, 0, 0, .28) !important;
        }

        html[data-tema-aparencia="escuro"] .card,
        html[data-tema-aparencia="escuro"] .card-box,
        html[data-tema-aparencia="escuro"] .conteudo {
            box-shadow: 0 2px 12px rgba(0, 0, 0, .18) !important;
        }

        html[data-tema-aparencia="escuro"] .sidebar {
            background: #102f22 !important;
            color: #ffffff !important;
        }

        html[data-tema-aparencia="escuro"] .logo {
            background: #16452f !important;
        }

        html[data-tema-aparencia="escuro"] .sidebar .menu a {
            color: #f0fdf4 !important;
        }

        html[data-tema-aparencia="escuro"] .sidebar .menu a:hover,
        html[data-tema-aparencia="escuro"] .sidebar .menu a.active {
            background: #166534 !important;
        }

        html[data-tema-aparencia="escuro"] .bg-success.bg-opacity-10 {
            background: rgba(34, 197, 94, .16) !important;
        }
    `;


    function normalizarTema(tema) {
        return tema === "escuro" ? "escuro" : "claro";
    }


    function lerConfiguracoesLocais() {

        try {

            const dados =
                localStorage.getItem(CHAVE_LOCAL);

            return dados ? JSON.parse(dados) : {};

        } catch (erro) {

            console.warn(
                "Não foi possível ler as preferências locais de aparência:",
                erro
            );

            return {};

        }

    }


    function salvarConfiguracoesLocais(configuracoes) {

        try {

            const atuais =
                lerConfiguracoesLocais();

            localStorage.setItem(
                CHAVE_LOCAL,
                JSON.stringify({
                    ...atuais,
                    ...configuracoes
                })
            );

            return true;

        } catch (erro) {

            console.warn(
                "Não foi possível salvar as preferências locais de aparência:",
                erro
            );

            return false;

        }

    }


    function instalarEstilos() {

        if (
            document.getElementById(
                "pelada-da-fe-estilos-tema"
            )
        ) {
            return;
        }

        const estilo =
            document.createElement("style");

        estilo.id =
            "pelada-da-fe-estilos-tema";

        estilo.textContent =
            ESTILOS_TEMA;

        document.head.appendChild(estilo);

    }


    function aplicar(
        tema,
        opcoes = {}
    ) {

        const temaNormalizado =
            normalizarTema(tema);

        const origem =
            opcoes.origem || "usuario";

        if (
            !["servidor", "local"].includes(origem)
        ) {
            revisaoTema++;
        }

        const raiz =
            document.documentElement;

        raiz.setAttribute(
            "data-tema-aparencia",
            temaNormalizado
        );

        raiz.setAttribute(
            "data-bs-theme",
            temaNormalizado === "escuro"
                ? "dark"
                : "light"
        );

        if (opcoes.salvarLocal === true) {

            salvarConfiguracoesLocais({
                temaAparencia: temaNormalizado
            });

        }

        return temaNormalizado;

    }


    async function sincronizarComServidor() {

        const revisaoInicial =
            revisaoTema;

        try {

            const resposta =
                await fetch(
                    URL_API,
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );

            if (!resposta.ok) {

                throw new Error(
                    `HTTP ${resposta.status}`
                );

            }

            const dados =
                await resposta.json();

            const configuracoes =
                dados?.configuracoes;

            if (!configuracoes) {

                throw new Error(
                    "A API não retornou as configurações de aparência."
                );

            }

            // Uma resposta antiga não deve substituir uma escolha feita durante a consulta.
            if (revisaoTema !== revisaoInicial) {
                return;
            }

            salvarConfiguracoesLocais({

                duracaoPeladaMinutos:
                    configuracoes.duracaoPeladaMinutos,

                duracaoPartidaMinutos:
                    configuracoes.duracaoPartidaMinutos,

                temaAparencia:
                    normalizarTema(
                        configuracoes.temaAparencia
                    )

            });

            aplicar(
                configuracoes.temaAparencia,
                { origem: "servidor" }
            );

        } catch (erro) {

            // O tema local já foi aplicado; a tela continua utilizável sem servidor.
            console.info(
                "Tema global: usando a preferência local enquanto o servidor estiver indisponível."
            );

        }

    }


    instalarEstilos();

    aplicar(
        lerConfiguracoesLocais().temaAparencia,
        { origem: "local" }
    );

    window.PeladaDaFeTema = {
        aplicar,
        sincronizarComServidor,

        obterTema: () =>
            normalizarTema(
                document.documentElement.getAttribute(
                    "data-tema-aparencia"
                )
            )
    };

    // Carrega o tema do MongoDB mesmo que a primeira tela seja o Dashboard.
    sincronizarComServidor();

})();