(function () {

    "use strict";

    const CHAVE_CONFIGURACOES_LOCAL =
        "peladaDaFeConfiguracoes";

    const URL_API_CONFIGURACOES =
        "/api/configuracoes";

    const CONFIGURACOES_PADRAO = {
        duracaoPeladaMinutos: 60,
        duracaoPartidaMinutos: 7
    };

    let salvandoConfiguracoes = false;


    function obterElemento(id) {

        return document.getElementById(id);

    }


    function normalizarConfiguracoes(configuracoes) {

        const duracaoPeladaMinutos = Number(
            configuracoes?.duracaoPeladaMinutos ??
            CONFIGURACOES_PADRAO.duracaoPeladaMinutos
        );

        const duracaoPartidaMinutos = Number(
            configuracoes?.duracaoPartidaMinutos ??
            CONFIGURACOES_PADRAO.duracaoPartidaMinutos
        );

        return {

            duracaoPeladaMinutos:
                Number.isInteger(duracaoPeladaMinutos) &&
                duracaoPeladaMinutos >= 1 &&
                duracaoPeladaMinutos <= 720
                    ? duracaoPeladaMinutos
                    : CONFIGURACOES_PADRAO.duracaoPeladaMinutos,

            duracaoPartidaMinutos:
                Number.isInteger(duracaoPartidaMinutos) &&
                duracaoPartidaMinutos >= 1 &&
                duracaoPartidaMinutos <= 720
                    ? duracaoPartidaMinutos
                    : CONFIGURACOES_PADRAO.duracaoPartidaMinutos

        };

    }


    function lerConfiguracoesLocais() {

        try {

            const dados =
                localStorage.getItem(
                    CHAVE_CONFIGURACOES_LOCAL
                );

            if (!dados) {

                return {
                    ...CONFIGURACOES_PADRAO
                };

            }

            return normalizarConfiguracoes(
                JSON.parse(dados)
            );

        } catch (erro) {

            console.error(
                "Erro ao ler a cópia local das configurações:",
                erro
            );

            return {
                ...CONFIGURACOES_PADRAO
            };

        }

    }


    function salvarCopiaLocal(configuracoes) {

        try {

            localStorage.setItem(
                CHAVE_CONFIGURACOES_LOCAL,
                JSON.stringify(configuracoes)
            );

            return true;

        } catch (erro) {

            console.warn(
                "Não foi possível atualizar a cópia local das configurações:",
                erro
            );

            return false;

        }

    }


    function existeCopiaLocal() {

        try {

            return Boolean(
                localStorage.getItem(
                    CHAVE_CONFIGURACOES_LOCAL
                )
            );

        } catch (erro) {

            return false;

        }

    }


    function atualizarStatus(
        mensagem,
        tipo = "secondary"
    ) {

        const elemento =
            obterElemento(
                "statusConfiguracoes"
            );

        if (!elemento) {
            return;
        }

        elemento.textContent =
            mensagem;

        elemento.className =
            `badge bg-${tipo} fs-6`;

    }


    function formatarMinutos(minutos) {

        return minutos === 1
            ? "1 minuto"
            : `${minutos} minutos`;

    }


    function atualizarResumo() {

        const campoPelada =
            obterElemento(
                "duracaoPeladaPadrao"
            );

        const campoPartida =
            obterElemento(
                "duracaoPartidaPadrao"
            );

        const resumoPelada =
            obterElemento(
                "resumoDuracaoPelada"
            );

        const resumoPartida =
            obterElemento(
                "resumoDuracaoPartida"
            );


        if (campoPelada && resumoPelada) {

            const minutos =
                Number(campoPelada.value);

            resumoPelada.textContent =
                Number.isInteger(minutos) &&
                minutos >= 1 &&
                minutos <= 720
                    ? formatarMinutos(minutos)
                    : "Valor inválido";

        }


        if (campoPartida && resumoPartida) {

            const minutos =
                Number(campoPartida.value);

            resumoPartida.textContent =
                Number.isInteger(minutos) &&
                minutos >= 1 &&
                minutos <= 720
                    ? formatarMinutos(minutos)
                    : "Valor inválido";

        }

    }


    function preencherFormulario(configuracoes) {

        const config =
            normalizarConfiguracoes(
                configuracoes
            );

        const campoPelada =
            obterElemento(
                "duracaoPeladaPadrao"
            );

        const campoPartida =
            obterElemento(
                "duracaoPartidaPadrao"
            );


        if (campoPelada) {

            campoPelada.value =
                config.duracaoPeladaMinutos;

        }


        if (campoPartida) {

            campoPartida.value =
                config.duracaoPartidaMinutos;

        }

        atualizarResumo();

    }


    function validarFormulario() {

        const campoPelada =
            obterElemento(
                "duracaoPeladaPadrao"
            );

        const campoPartida =
            obterElemento(
                "duracaoPartidaPadrao"
            );


        if (!campoPelada || !campoPartida) {

            return {
                valido: false,
                mensagem:
                    "Não foi possível localizar os campos de configuração."
            };

        }


        const duracaoPelada =
            Number(campoPelada.value);

        const duracaoPartida =
            Number(campoPartida.value);


        if (
            !Number.isInteger(duracaoPelada) ||
            duracaoPelada < 1 ||
            duracaoPelada > 720
        ) {

            return {
                valido: false,

                mensagem:
                    "A duração da Pelada precisa ser um número inteiro entre 1 e 720 minutos."
            };

        }


        if (
            !Number.isInteger(duracaoPartida) ||
            duracaoPartida < 1 ||
            duracaoPartida > 720
        ) {

            return {
                valido: false,

                mensagem:
                    "A duração da partida precisa ser um número inteiro entre 1 e 720 minutos."
            };

        }


        return {
            valido: true,

            configuracoes: {
                duracaoPeladaMinutos: duracaoPelada,
                duracaoPartidaMinutos: duracaoPartida
            }
        };

    }


    async function lerRespostaApi(resposta) {

        let dados = null;

        try {

            dados = await resposta.json();

        } catch (erro) {

            dados = null;

        }


        if (!resposta.ok) {

            throw new Error(
                dados?.erro ||
                dados?.message ||
                `O servidor respondeu com o status ${resposta.status}.`
            );

        }

        return dados;

    }


    async function carregarConfiguracoesDoServidor() {

        const resposta =
            await fetch(
                URL_API_CONFIGURACOES,
                {
                    method: "GET",

                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        const dados =
            await lerRespostaApi(resposta);


        if (!dados?.configuracoes) {

            throw new Error(
                "A resposta do servidor não contém as configurações esperadas."
            );

        }


        const configuracoes =
            normalizarConfiguracoes(
                dados.configuracoes
            );

        salvarCopiaLocal(configuracoes);

        preencherFormulario(configuracoes);

        atualizarStatus(
            "Sincronizadas com servidor",
            "success"
        );

        console.log(
            "Configurações carregadas do MongoDB:",
            configuracoes
        );

    }


    async function salvarConfiguracoes(configuracoes) {

        const config =
            normalizarConfiguracoes(
                configuracoes
            );

        // Mantém uma cópia local para a tela Partidas
        // e como contingência se o servidor estiver indisponível.
        const copiaLocalSalva =
            salvarCopiaLocal(config);


        try {

            const resposta =
                await fetch(
                    URL_API_CONFIGURACOES,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify(config)
                    }
                );

            const dados =
                await lerRespostaApi(resposta);

            const configuracoesSalvas =
                normalizarConfiguracoes(
                    dados?.configuracoes || config
                );

            salvarCopiaLocal(
                configuracoesSalvas
            );

            preencherFormulario(
                configuracoesSalvas
            );

            atualizarStatus(
                "Sincronizadas com servidor",
                "success"
            );

            console.log(
                "Configurações salvas no MongoDB:",
                configuracoesSalvas
            );

            return {
                sincronizado: true,
                localSalvo: copiaLocalSalva,
                configuracoes: configuracoesSalvas
            };

        } catch (erro) {

            console.error(
                "Não foi possível sincronizar as configurações com o servidor:",
                erro
            );

            if (copiaLocalSalva) {

                atualizarStatus(
                    "Salvas só neste navegador",
                    "warning"
                );

            } else {

                atualizarStatus(
                    "Falha ao salvar",
                    "danger"
                );

            }

            atualizarResumo();

            return {
                sincronizado: false,
                localSalvo: copiaLocalSalva,
                erro
            };

        }

    }


    function mostrarAviso(
        titulo,
        mensagem,
        tipo = "warning"
    ) {

        if (typeof Swal !== "undefined") {

            return Swal.fire({
                icon: tipo,
                title: titulo,
                text: mensagem
            });

        }

        alert(
            `${titulo}\n\n${mensagem}`
        );

        return Promise.resolve();

    }


    function mostrarToastSucesso(mensagem) {

        if (typeof toast === "function") {

            toast(
                mensagem,
                "#198754"
            );

            return;

        }


        if (typeof Swal !== "undefined") {

            Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: mensagem,
                timer: 2200,
                showConfirmButton: false
            });

            return;

        }

        console.log(mensagem);

    }


    function definirSalvamentoEmAndamento(emAndamento) {

        salvandoConfiguracoes =
            emAndamento;

        const botaoSalvar =
            obterElemento(
                "btnSalvarConfiguracoes"
            );

        const botaoRestaurar =
            obterElemento(
                "btnRestaurarConfiguracoes"
            );


        if (botaoSalvar) {

            botaoSalvar.disabled =
                emAndamento;

            botaoSalvar.innerHTML =
                emAndamento
                    ? `
                        <span
                            class="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                        ></span>
                        Salvando...
                    `
                    : `
                        <i class="bi bi-check-circle me-1"></i>
                        Salvar configurações
                    `;

        }


        if (botaoRestaurar) {

            botaoRestaurar.disabled =
                emAndamento;

        }

    }


    async function processarSalvamento(configuracoes) {

        if (salvandoConfiguracoes) {
            return;
        }

        definirSalvamentoEmAndamento(true);

        try {

            const resultado =
                await salvarConfiguracoes(
                    configuracoes
                );


            if (resultado.sincronizado) {

                mostrarToastSucesso(
                    "Configurações salvas e sincronizadas com o servidor!"
                );

                return;

            }


            if (resultado.localSalvo) {

                await mostrarAviso(
                    "Configurações salvas localmente",

                    "Não foi possível sincronizar com o servidor. As preferências ficaram salvas apenas neste navegador e não aparecerão nos outros dispositivos até que a conexão seja restabelecida e você salve novamente.",

                    "warning"
                );

                return;

            }


            await mostrarAviso(
                "Falha ao salvar",

                "Não foi possível gravar as configurações no servidor nem neste navegador. Verifique a conexão e tente novamente.",

                "error"
            );

        } finally {

            definirSalvamentoEmAndamento(false);

        }

    }


    function configurarEventos() {

        const formulario =
            obterElemento(
                "formConfiguracoes"
            );

        const btnRestaurar =
            obterElemento(
                "btnRestaurarConfiguracoes"
            );

        const campoPelada =
            obterElemento(
                "duracaoPeladaPadrao"
            );

        const campoPartida =
            obterElemento(
                "duracaoPartidaPadrao"
            );


        if (campoPelada) {

            campoPelada.addEventListener(
                "input",
                atualizarResumo
            );

        }


        if (campoPartida) {

            campoPartida.addEventListener(
                "input",
                atualizarResumo
            );

        }


        if (formulario) {

            formulario.addEventListener(
                "submit",
                async evento => {

                    evento.preventDefault();

                    if (salvandoConfiguracoes) {
                        return;
                    }

                    const resultado =
                        validarFormulario();


                    if (!resultado.valido) {

                        atualizarStatus(
                            "Verifique os valores",
                            "danger"
                        );

                        await mostrarAviso(
                            "Verifique as configurações",
                            resultado.mensagem,
                            "warning"
                        );

                        return;

                    }


                    await processarSalvamento(
                        resultado.configuracoes
                    );

                }
            );

        }


        if (btnRestaurar) {

            btnRestaurar.addEventListener(
                "click",
                async () => {

                    if (salvandoConfiguracoes) {
                        return;
                    }

                    let confirmou = false;


                    if (typeof Swal !== "undefined") {

                        const resultado =
                            await Swal.fire({

                                icon: "question",

                                title: "Restaurar padrões?",

                                text:
                                    "Os tempos voltarão para 60 minutos por Pelada e 7 minutos por partida. Essa alteração também será enviada ao servidor para uso nos demais dispositivos.",

                                showCancelButton: true,

                                confirmButtonText:
                                    "Sim, restaurar",

                                cancelButtonText:
                                    "Cancelar",

                                confirmButtonColor:
                                    "#198754"

                            });

                        confirmou =
                            resultado.isConfirmed;

                    } else {

                        confirmou =
                            window.confirm(
                                "Restaurar os valores padrão de 60 minutos para a Pelada e 7 minutos para cada partida?"
                            );

                    }


                    if (!confirmou) {
                        return;
                    }


                    preencherFormulario(
                        CONFIGURACOES_PADRAO
                    );

                    await processarSalvamento({
                        ...CONFIGURACOES_PADRAO
                    });

                }
            );

        }

    }


    async function inicializar() {

        configurarEventos();

        // Mostra a cópia local imediatamente enquanto consulta o servidor.
        const configuracoesLocais =
            lerConfiguracoesLocais();

        preencherFormulario(
            configuracoesLocais
        );

        atualizarStatus(
            "Carregando configurações...",
            "secondary"
        );


        try {

            await carregarConfiguracoesDoServidor();

        } catch (erro) {

            console.warn(
                "Servidor de configurações indisponível; utilizando a cópia local:",
                erro
            );

            preencherFormulario(
                lerConfiguracoesLocais()
            );

            atualizarStatus(
                existeCopiaLocal()
                    ? "Usando cópia local"
                    : "Servidor indisponível",

                "warning"
            );

        }


        console.log(
            "⚙️ Módulo Configurações iniciado."
        );

    }


    inicializar();

})();