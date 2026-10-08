// ============================================================
// PELADA DA FÉ - NAVEGAÇÃO DA SPA
// ============================================================

(() => {

    "use strict";


    const paginaInicial =
        "dashboard";


    let navegacaoId =
        0;


    // ============================================================
    // TÍTULOS DAS PÁGINAS
    // ============================================================

    const titulos = {

        dashboard:
            "Dashboard",

        jogadores:
            "Jogadores",

        peladas:
            "Peladas",

        sorteio:
            "Sorteio",

        partidas:
            "Partidas",

        artilharia:
            "Artilharia",

        estatisticas:
            "Estatísticas",

        historico:
            "Histórico",

        configuracoes:
            "Configurações"

    };


    // ============================================================
    // MENU LATERAL
    // ============================================================

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const menuBtn =
        document.getElementById(
            "menu-btn"
        );


    if (
        menuBtn &&
        sidebar
    ) {

        menuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "active"
                );

            }
        );

    }


    // ============================================================
    // RELÓGIO
    // ============================================================

    function atualizarRelogio() {

        const agora =
            new Date();


        const relogio =
            document.getElementById(
                "relogio"
            );


        if (relogio) {

            relogio.textContent =
                agora.toLocaleDateString(
                    "pt-BR"
                ) +
                " • " +
                agora.toLocaleTimeString(
                    "pt-BR"
                );

        }

    }


    setInterval(
        atualizarRelogio,
        1000
    );


    atualizarRelogio();


    // ============================================================
    // LIMPAR MÓDULO DA PÁGINA ANTERIOR
    // ============================================================

    function removerScriptPagina() {

        // --------------------------------------------------------
        // PARTIDAS
        // --------------------------------------------------------

        if (
            window.Partidas &&
            typeof window.Partidas.destroy ===
                "function"
        ) {

            try {

                window.Partidas.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Partidas:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // PELADAS
        // --------------------------------------------------------

        if (
            window.Peladas &&
            typeof window.Peladas.destroy ===
                "function"
        ) {

            try {

                window.Peladas.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Peladas:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // DASHBOARD
        // --------------------------------------------------------

        if (
            window.Dashboard &&
            typeof window.Dashboard.destroy ===
                "function"
        ) {

            try {

                window.Dashboard.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Dashboard:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // HISTÓRICO
        // --------------------------------------------------------

        if (
            window.Historico &&
            typeof window.Historico.destroy ===
                "function"
        ) {

            try {

                window.Historico.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Histórico:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // SORTEIO
        // --------------------------------------------------------

        if (
            window.Sorteio &&
            typeof window.Sorteio.destroy ===
                "function"
        ) {

            try {

                window.Sorteio.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Sorteio:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // ARTILHARIA
        // --------------------------------------------------------

        if (
            window.Artilharia &&
            typeof window.Artilharia.destroy ===
                "function"
        ) {

            try {

                window.Artilharia.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Artilharia:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // ESTATÍSTICAS
        // --------------------------------------------------------

        if (
            window.Estatisticas &&
            typeof window.Estatisticas.destroy ===
                "function"
        ) {

            try {

                window.Estatisticas.destroy();

            } catch (erro) {

                console.warn(
                    "Erro ao destruir módulo Estatísticas:",
                    erro
                );

            }

        }


        // --------------------------------------------------------
        // REMOVER SCRIPT
        // --------------------------------------------------------

        const script =
            document.getElementById(
                "pagina-script"
            );


        if (script) {

            script.remove();

        }


        // --------------------------------------------------------
        // LIMPAR REFERÊNCIAS
        // --------------------------------------------------------

        if (
            window.Partidas
        ) {

            window.Partidas =
                null;

        }


        if (
            window.Peladas
        ) {

            window.Peladas =
                null;

        }


        if (
            window.Dashboard
        ) {

            window.Dashboard =
                null;

        }


        if (
            window.Historico
        ) {

            window.Historico =
                null;

        }


        if (
            window.Sorteio
        ) {

            window.Sorteio =
                null;

        }


        if (
            window.Artilharia
        ) {

            window.Artilharia =
                null;

        }


        if (
            window.Estatisticas
        ) {

            window.Estatisticas =
                null;

        }

    }


    // ============================================================
    // CARREGAR SERVIÇO
    // ============================================================

    function carregarServicePagina(
        nome
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const serviceId =
                    `service-${nome}`;


                const existente =
                    document.getElementById(
                        serviceId
                    );


                if (existente) {

                    resolve();

                    return;

                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.id =
                    serviceId;


                script.src =
                    `assets/js/services/${nome}Service.js`;


                script.onload =
                    resolve;


                script.onerror =
                    () => {

                        reject(
                            new Error(
                                `Serviço "${nome}" não encontrado.`
                            )
                        );

                    };


                document.body.appendChild(
                    script
                );

            }
        );

    }


    // ============================================================
    // CARREGAR MÓDULO DA PÁGINA
    // ============================================================

    function carregarScriptPagina(
        nome,
        id
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.id =
                    "pagina-script";


                // Evita problemas de cache
                // durante o desenvolvimento.

                script.src =
                    `assets/js/modules/${nome}.js?v=${Date.now()}`;


                script.onload =
                    () => {

                        if (
                            id ===
                            navegacaoId
                        ) {

                            resolve();

                        }

                    };


                script.onerror =
                    () => {

                        if (
                            id ===
                            navegacaoId
                        ) {

                            reject(
                                new Error(
                                    `Módulo "${nome}" não encontrado.`
                                )
                            );

                        }

                    };


                document.body.appendChild(
                    script
                );

            }
        );

    }


    // ============================================================
    // ATUALIZAR TÍTULO
    // ============================================================

    function atualizarTitulo(
        nome
    ) {

        const titulo =
            document.getElementById(
                "tituloPagina"
            );


        if (titulo) {

            titulo.textContent =
                titulos[nome] ||
                nome
                    .charAt(0)
                    .toUpperCase() +
                nome.slice(1);

        }

    }


    // ============================================================
    // MARCAR ITEM ATIVO
    // ============================================================

    function atualizarMenuAtivo(
        nome
    ) {

        document
            .querySelectorAll(
                ".menu a[data-page]"
            )
            .forEach(
                link => {

                    link.classList.toggle(
                        "active",
                        link.dataset.page ===
                            nome
                    );

                }
            );

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


        if (
            !conteudo ||
            !nome
        ) {

            return;

        }


        // --------------------------------------------------------
        // LIMPAR PÁGINA ANTERIOR
        // --------------------------------------------------------

        removerScriptPagina();


        // --------------------------------------------------------
        // LOADING
        // --------------------------------------------------------

        conteudo.innerHTML = `

            <div
                class="
                    d-flex
                    justify-content-center
                    align-items-center
                    py-5
                "
            >

                <div
                    class="
                        spinner-border
                        text-success
                    "
                    role="status"
                >

                    <span
                        class="visually-hidden"
                    >
                        Carregando...
                    </span>

                </div>

            </div>

        `;


        // --------------------------------------------------------
        // TÍTULO
        // --------------------------------------------------------

        atualizarTitulo(
            nome
        );


        // --------------------------------------------------------
        // MENU ATIVO
        // --------------------------------------------------------

        atualizarMenuAtivo(
            nome
        );


        // --------------------------------------------------------
        // HISTÓRICO DO NAVEGADOR
        // --------------------------------------------------------

        if (
            atualizarHistorico
        ) {

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

            // ----------------------------------------------------
            // CARREGAR HTML DA VIEW
            // ----------------------------------------------------

            const resposta =
                await fetch(
                    `views/${nome}.html`,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                id !==
                navegacaoId
            ) {

                return;

            }


            if (
                !resposta.ok
            ) {

                throw new Error(
                    `Não foi possível carregar a página "${nome}".`
                );

            }


            const html =
                await resposta.text();


            if (
                id !==
                navegacaoId
            ) {

                return;

            }


            conteudo.innerHTML =
                html;


            if (
                id !==
                navegacaoId
            ) {

                return;

            }


            // ----------------------------------------------------
            // SERVIÇO DE JOGADORES
            // ----------------------------------------------------

            if (
                nome ===
                "jogadores"
            ) {

                await carregarServicePagina(
                    "jogador"
                );

            }


            if (
                id !==
                navegacaoId
            ) {

                return;

            }


            // ====================================================
            // PÁGINAS COM MÓDULOS JAVASCRIPT
            // ====================================================

            const paginasComModulo =
                new Set([

                    "dashboard",

                    "jogadores",

                    "peladas",

                    "sorteio",

                    "partidas",

                    "artilharia",

                    "estatisticas",

                    "historico"

                ]);


            // ----------------------------------------------------
            // CARREGAR MÓDULO
            // ----------------------------------------------------

            if (
                paginasComModulo.has(
                    nome
                )
            ) {

                await carregarScriptPagina(
                    nome,
                    id
                );

            }

        } catch (erro) {

            if (
                id !==
                navegacaoId
            ) {

                return;

            }


            console.error(
                "Erro ao carregar página:",
                erro
            );


            conteudo.innerHTML = `

                <div
                    class="
                        alert
                        alert-danger
                        mt-3
                    "
                >

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

    document
        .querySelector(
            ".menu"
        )
        ?.addEventListener(
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


                // ------------------------------------------------
                // FECHAR MENU NO CELULAR
                // ------------------------------------------------

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


    // ============================================================
    // VOLTAR / AVANÇAR DO NAVEGADOR
    // ============================================================

    window.addEventListener(
        "popstate",
        () => {

            const pagina =
                window.location.hash.replace(
                    "#",
                    ""
                ) ||
                paginaInicial;


            carregarPagina(
                pagina,
                {
                    atualizarHistorico:
                        false
                }
            );

        }
    );


    // ============================================================
    // PRIMEIRA TELA
    // ============================================================

    const paginaAtual =
        window.location.hash.replace(
            "#",
            ""
        ) ||
        paginaInicial;


    carregarPagina(
        paginaAtual,
        {
            atualizarHistorico:
                false
        }
    );

})();