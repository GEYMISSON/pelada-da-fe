// ============================================================
// PELADA DA FÉ - NAVEGAÇÃO DA SPA
// ============================================================

(() => {
    "use strict";

    const paginaInicial = "dashboard";

    let navegacaoId = 0;

    const titulos = {
        dashboard: "Dashboard",
        jogadores: "Jogadores",
        peladas: "Peladas",
        sorteio: "Sorteio",
        partidas: "Partidas",
        artilharia: "Artilharia",
        estatisticas: "Estatísticas",
        historico: "Histórico",
        configuracoes: "Configurações"
    };

    // ============================================================
    // MENU LATERAL
    // ============================================================

    const sidebar = document.querySelector(".sidebar");
    const menuBtn = document.getElementById("menu-btn");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }

    // ============================================================
    // RELÓGIO
    // ============================================================

    function atualizarRelogio() {
        const agora = new Date();

        const relogio =
            document.getElementById("relogio");

        if (relogio) {
            relogio.textContent =
                agora.toLocaleDateString("pt-BR") +
                " • " +
                agora.toLocaleTimeString("pt-BR");
        }
    }

    setInterval(atualizarRelogio, 1000);

    atualizarRelogio();

    // ============================================================
    // DESTRUIR MÓDULO DA PÁGINA ANTERIOR
    // ============================================================

    function removerScriptPagina() {

        /*
         * Antes de remover o módulo atual,
         * damos oportunidade para ele limpar
         * timers e eventos.
         */

        if (
            window.Partidas &&
            typeof window.Partidas.destroy === "function"
        ) {
            window.Partidas.destroy();
        }

        const script =
            document.getElementById("pagina-script");

        if (script) {
            script.remove();
        }

        /*
         * Evita reutilizar uma instância antiga.
         */

        if (window.Partidas) {
            window.Partidas = null;
        }

    }

    // ============================================================
    // CARREGAR SERVICE
    // ============================================================

    function carregarServicePagina(nome) {

        return new Promise((resolve, reject) => {

            const serviceId =
                `service-${nome}`;

            const existente =
                document.getElementById(serviceId);

            if (existente) {
                resolve();
                return;
            }

            const script =
                document.createElement("script");

            script.id =
                serviceId;

            script.src =
                `assets/js/services/${nome}Service.js`;

            script.onload = () => {
                resolve();
            };

            script.onerror = () => {
                reject(
                    new Error(
                        `Serviço "${nome}" não encontrado.`
                    )
                );
            };

            document.body.appendChild(script);

        });

    }

    // ============================================================
    // CARREGAR MÓDULO DA PÁGINA
    // ============================================================

    function carregarScriptPagina(nome, id) {

        return new Promise((resolve, reject) => {

            const script =
                document.createElement("script");

            script.id =
                "pagina-script";

            /*
             * O timestamp evita que o navegador
             * utilize uma versão antiga em cache.
             */

            script.src =
                `assets/js/modules/${nome}.js?v=${Date.now()}`;

            script.onload = () => {

                if (id === navegacaoId) {
                    resolve();
                }

            };

            script.onerror = () => {

                if (id === navegacaoId) {

                    reject(
                        new Error(
                            `Módulo "${nome}" não encontrado.`
                        )
                    );

                }

            };

            document.body.appendChild(script);

        });

    }

    // ============================================================
    // ATUALIZAR TÍTULO
    // ============================================================

    function atualizarTitulo(nome) {

        const titulo =
            document.getElementById(
                "tituloPagina"
            );

        if (titulo) {

            titulo.textContent =
                titulos[nome] ||
                nome.charAt(0).toUpperCase() +
                nome.slice(1);

        }

    }

    // ============================================================
    // MENU ATIVO
    // ============================================================

    function atualizarMenuAtivo(nome) {

        document
            .querySelectorAll(".menu a[data-page]")
            .forEach(link => {

                link.classList.toggle(
                    "active",
                    link.dataset.page === nome
                );

            });

    }

    // ============================================================
    // CARREGAR PÁGINA
    // ============================================================

    async function carregarPagina(
        nome,
        {
            atualizarHistorico = true
        } = {}
    ) {

        const id =
            ++navegacaoId;

        const conteudo =
            document.getElementById(
                "conteudo"
            );

        if (!conteudo || !nome) {
            return;
        }

        /*
         * Cancela o módulo anterior.
         */

        removerScriptPagina();

        /*
         * Tela de carregamento.
         */

        conteudo.innerHTML = `
            <div class="d-flex justify-content-center align-items-center py-5">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">
                        Carregando...
                    </span>
                </div>
            </div>
        `;

        atualizarTitulo(nome);

        atualizarMenuAtivo(nome);

        /*
         * Atualiza URL.
         */

        if (atualizarHistorico) {

            const novoHash =
                `#${nome}`;

            if (
                window.location.hash !==
                novoHash
            ) {

                history.pushState(
                    {
                        pagina: nome
                    },
                    "",
                    novoHash
                );

            }

        }

        try {

            const resposta =
                await fetch(
                    `views/${nome}.html`,
                    {
                        cache: "no-store"
                    }
                );

            /*
             * Outra navegação aconteceu enquanto
             * esta página estava carregando.
             */

            if (id !== navegacaoId) {
                return;
            }

            if (!resposta.ok) {

                throw new Error(
                    `Não foi possível carregar a página "${nome}".`
                );

            }

            const html =
                await resposta.text();

            if (id !== navegacaoId) {
                return;
            }

            conteudo.innerHTML =
                html;

            /*
             * Jogadores precisa do service.
             */

            if (nome === "jogadores") {

                await carregarServicePagina(
                    "jogador"
                );

            }

            if (id !== navegacaoId) {
                return;
            }

            /*
             * Páginas que possuem módulo JS próprio.
             */

            const paginasComModulo =
                new Set([
                    "jogadores",
                    "sorteio",
                    "partidas"
                ]);

            if (
                paginasComModulo.has(nome)
            ) {

                await carregarScriptPagina(
                    nome,
                    id
                );

            }

        } catch (erro) {

            if (id !== navegacaoId) {
                return;
            }

            console.error(
                "Erro ao carregar página:",
                erro
            );

            conteudo.innerHTML = `
                <div class="alert alert-danger mt-3">
                    <strong>
                        Erro ao carregar a página.
                    </strong>

                    <br>

                    ${erro.message}
                </div>
            `;

        }

    }

    // ============================================================
    // MENU
    // ============================================================

    const menu =
        document.querySelector(".menu");

    if (menu) {

        menu.addEventListener(
            "click",
            evento => {

                const link =
                    evento.target.closest(
                        "a[data-page]"
                    );

                if (!link) {
                    return;
                }

                evento.preventDefault();

                const pagina =
                    link.dataset.page;

                if (!pagina) {
                    return;
                }

                /*
                 * Fecha o menu no celular.
                 */

                if (sidebar) {

                    sidebar.classList.remove(
                        "active"
                    );

                }

                carregarPagina(
                    pagina
                );

            }
        );

    }

    // ============================================================
    // VOLTAR / AVANÇAR DO NAVEGADOR
    // ============================================================

    window.addEventListener(
        "popstate",
        () => {

            const pagina =
                window.location.hash
                    .replace("#", "") ||
                paginaInicial;

            carregarPagina(
                pagina,
                {
                    atualizarHistorico: false
                }
            );

        }
    );

    // ============================================================
    // PRIMEIRA PÁGINA
    // ============================================================

    const paginaAtual =
        window.location.hash
            .replace("#", "") ||
        paginaInicial;

    carregarPagina(
        paginaAtual,
        {
            atualizarHistorico: false
        }
    );

})();