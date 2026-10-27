
(() => {
    "use strict";

    const CHAVE_CONFIGURACOES =
        "peladaDaFeConfiguracoes";

    const URL_API =
        "/api/configuracoes";

    const ID_BOTAO =
        "botaoAlternarTemaGlobal";


    // --------------------------------------------------
    // LER AS CONFIGURACOES SALVAS NO NAVEGADOR
    // --------------------------------------------------

    function obterConfiguracoesLocais() {
        try {
            const dados = localStorage.getItem(
                CHAVE_CONFIGURACOES
            );

            return dados ? JSON.parse(dados) : {};
        } catch (erro) {
            console.warn(
                "Não foi possível ler as configurações locais:",
                erro
            );

            return {};
        }
    }


    // --------------------------------------------------
    // SALVAR O TEMA NO NAVEGADOR
    // --------------------------------------------------

    function salvarTemaLocal(tema, configuracoesExtras = {}) {
        try {
            const atuais =
                obterConfiguracoesLocais();

            const atualizadas = {
                ...atuais,
                ...configuracoesExtras,
                temaAparencia: tema
            };

            localStorage.setItem(
                CHAVE_CONFIGURACOES,
                JSON.stringify(atualizadas)
            );

            return true;
        } catch (erro) {
            console.warn(
                "Não foi possível salvar o tema localmente:",
                erro
            );

            return false;
        }
    }


    // --------------------------------------------------
    // IDENTIFICAR O TEMA ATUAL
    // --------------------------------------------------

    function obterTemaAtual() {
        const apiTema =
            window.PeladaDaFeTema;

        if (
            apiTema &&
            typeof apiTema.obterTema === "function"
        ) {
            const tema = apiTema.obterTema();

            if (tema === "claro" || tema === "escuro") {
                return tema;
            }
        }

        const temaHtml =
            document.documentElement.getAttribute(
                "data-tema-aparencia"
            );

        if (temaHtml === "claro" || temaHtml === "escuro") {
            return temaHtml;
        }

        const configuracoes =
            obterConfiguracoesLocais();

        return configuracoes.temaAparencia === "escuro"
            ? "escuro"
            : "claro";
    }


    // --------------------------------------------------
    // APLICAR O TEMA
    // --------------------------------------------------

    function aplicarTema(tema) {
        const temaValido =
            tema === "escuro" ? "escuro" : "claro";

        const apiTema =
            window.PeladaDaFeTema;

        if (
            apiTema &&
            typeof apiTema.aplicar === "function"
        ) {
            apiTema.aplicar(temaValido);
        } else {
            document.documentElement.setAttribute(
                "data-tema-aparencia",
                temaValido
            );

            document.documentElement.setAttribute(
                "data-bs-theme",
                temaValido
            );
        }

        salvarTemaLocal(temaValido);

        atualizarBotao(temaValido);
        atualizarCampoConfiguracoes(temaValido);

        return temaValido;
    }


    // --------------------------------------------------
    // ATUALIZAR O TEXTO DO BOTAO
    // --------------------------------------------------

    function atualizarBotao(tema) {
        const botao =
            document.getElementById(ID_BOTAO);

        if (!botao) {
            return;
        }

        const temaEscuro =
            tema === "escuro";

        const icone =
            temaEscuro ? "☀️" : "🌙";

        const texto =
            temaEscuro
                ? "Ativar tema claro"
                : "Ativar tema escuro";

        botao.innerHTML = `
            <span
                class="tema-botao-icone"
                aria-hidden="true"
            >${icone}</span>

            <span>${texto}</span>
        `;

        botao.title = texto;
        botao.setAttribute("aria-label", texto);
    }


    // --------------------------------------------------
    // MANTER O SELETOR DE CONFIGURACOES ATUALIZADO
    // --------------------------------------------------

    function atualizarCampoConfiguracoes(tema) {
        const campo =
            document.getElementById("temaAparencia");

        if (campo) {
            campo.value = tema;
        }
    }


    // --------------------------------------------------
    // SALVAR TEMA NO MONGODB
    // --------------------------------------------------

    async function sincronizarTemaComServidor(tema) {
        const respostaLeitura = await fetch(
            URL_API,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const dadosLeitura =
            await respostaLeitura.json();

        if (!respostaLeitura.ok) {
            throw new Error(
                dadosLeitura?.erro ||
                "Não foi possível consultar as configurações."
            );
        }

        const servidor =
            dadosLeitura?.configuracoes || {};

        const locais =
            obterConfiguracoesLocais();

        const configuracoes = {
            duracaoPeladaMinutos: Number(
                servidor.duracaoPeladaMinutos ??
                locais.duracaoPeladaMinutos ??
                60
            ),

            duracaoPartidaMinutos: Number(
                servidor.duracaoPartidaMinutos ??
                locais.duracaoPartidaMinutos ??
                7
            ),

            temaAparencia: tema
        };

        const respostaGravacao = await fetch(
            URL_API,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(configuracoes)
            }
        );

        const dadosGravacao =
            await respostaGravacao.json();

        if (!respostaGravacao.ok) {
            throw new Error(
                dadosGravacao?.erro ||
                "Não foi possível salvar o tema no servidor."
            );
        }

        const configuracoesSalvas =
            dadosGravacao?.configuracoes ||
            configuracoes;

        salvarTemaLocal(
            tema,
            configuracoesSalvas
        );

        return configuracoesSalvas;
    }


    // --------------------------------------------------
    // NOTIFICAR O RESULTADO
    // --------------------------------------------------

    function notificar(mensagem, sucesso) {
        if (typeof window.toast === "function") {
            window.toast(
                mensagem,
                sucesso ? "#198754" : "#dc3545"
            );

            return;
        }

        if (
            window.Swal &&
            typeof window.Swal.fire === "function"
        ) {
            window.Swal.fire({
                icon: sucesso ? "success" : "warning",
                title: sucesso
                    ? "Tema atualizado"
                    : "Atenção",
                text: mensagem,
                timer: 2400,
                showConfirmButton: false
            });

            return;
        }

        console.info(mensagem);
    }


    // --------------------------------------------------
    // ESTILIZACAO DO BOTAO
    // --------------------------------------------------

    function adicionarEstilos() {
        if (
            document.getElementById(
                "estilosBotaoTemaGlobal"
            )
        ) {
            return;
        }

        const estilo =
            document.createElement("style");

        estilo.id = "estilosBotaoTemaGlobal";

        estilo.textContent = `
            #${ID_BOTAO} {
                display: flex;
                align-items: center;
                gap: 10px;
                width: calc(100% - 24px);
                margin: 12px;
                padding: 11px 14px;
                border: 1px solid rgba(128, 128, 128, .4);
                border-radius: 10px;
                background: transparent;
                color: var(--bs-body-color, inherit);
                font: inherit;
                text-align: left;
                cursor: pointer;
                transition:
                    background-color .2s ease,
                    border-color .2s ease;
            }

            #${ID_BOTAO}:hover {
                background: rgba(128, 128, 128, .12);
            }

            #${ID_BOTAO}:focus-visible {
                outline: 2px solid var(--bs-primary, #0d6efd);
                outline-offset: 2px;
            }

            #${ID_BOTAO}:disabled {
                opacity: .65;
                cursor: wait;
            }

            #${ID_BOTAO} .tema-botao-icone {
                flex-shrink: 0;
                font-size: 1.15rem;
                line-height: 1;
            }
        `;

        document.head.appendChild(estilo);
    }


    // --------------------------------------------------
    // CRIAR BOTAO NO MENU LATERAL
    // --------------------------------------------------

    function criarBotao() {
        const menuLateral =
            document.querySelector(".sidebar");

        if (!menuLateral) {
            console.warn(
                "Menu lateral não encontrado. Verifique a classe .sidebar."
            );

            return;
        }

        if (document.getElementById(ID_BOTAO)) {
            return;
        }

        adicionarEstilos();

        const botao =
            document.createElement("button");

        botao.id = ID_BOTAO;
        botao.type = "button";

        atualizarBotao(obterTemaAtual());

        botao.addEventListener(
            "click",
            async () => {
                if (botao.disabled) {
                    return;
                }

                botao.disabled = true;

                try {
                    // Aguarda a sincronização inicial,
                    // caso o módulo de tema disponibilize essa função.
                    const apiTema =
                        window.PeladaDaFeTema;

                    if (
                        apiTema &&
                        typeof apiTema.sincronizarComServidor === "function"
                    ) {
                        try {
                            await apiTema.sincronizarComServidor();
                        } catch (erro) {
                            console.warn(
                                "Não foi possível sincronizar antes da troca:",
                                erro
                            );
                        }
                    }

                    const temaAtual =
                        obterTemaAtual();

                    const novoTema =
                        temaAtual === "escuro"
                            ? "claro"
                            : "escuro";

                    // Aplica imediatamente para o usuário.
                    aplicarTema(novoTema);

                    try {
                        const configuracoesSalvas =
                            await sincronizarTemaComServidor(
                                novoTema
                            );

                        // Garante que o tema continue aplicado
                        // mesmo após a resposta do servidor.
                        aplicarTema(novoTema);

                        salvarTemaLocal(
                            novoTema,
                            configuracoesSalvas
                        );

                        notificar(
                            "Tema salvo no servidor com sucesso.",
                            true
                        );
                    } catch (erro) {
                        console.warn(
                            "O tema foi alterado localmente, mas não foi sincronizado:",
                            erro
                        );

                        // A mudança visual continua ativa.
                        salvarTemaLocal(novoTema);

                        notificar(
                            "Tema alterado neste navegador, mas não foi possível sincronizar com o servidor.",
                            false
                        );
                    }
                } finally {
                    botao.disabled = false;
                    atualizarBotao(obterTemaAtual());
                }
            }
        );

        // Insere o botão depois da área de navegação,
        // quando ela existir.
        const menu =
            menuLateral.querySelector(
                "nav, .sidebar-menu, .menu"
            );

        if (menu) {
            menu.insertAdjacentElement(
                "afterend",
                botao
            );
        } else {
            menuLateral.appendChild(botao);
        }

        atualizarBotao(obterTemaAtual());
    }


    // --------------------------------------------------
    // INICIALIZACAO
    // --------------------------------------------------

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            criarBotao
        );
    } else {
        criarBotao();
    }

})();