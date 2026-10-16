(function () {
    "use strict";

    const CHAVE_LOCAL = "peladaDaFeConfiguracoes";
    const URL_API = "/api/configuracoes";

    const PADRAO = {
        duracaoPeladaMinutos: 60,
        duracaoPartidaMinutos: 7,
        temaAparencia: "claro"
    };

    let salvando = false;

    const elemento = id => document.getElementById(id);


    function normalizar(config = {}) {

        const pelada =
            Number(
                config.duracaoPeladaMinutos ??
                PADRAO.duracaoPeladaMinutos
            );

        const partida =
            Number(
                config.duracaoPartidaMinutos ??
                PADRAO.duracaoPartidaMinutos
            );

        return {

            duracaoPeladaMinutos:
                Number.isInteger(pelada) &&
                pelada >= 1 &&
                pelada <= 720
                    ? pelada
                    : PADRAO.duracaoPeladaMinutos,

            duracaoPartidaMinutos:
                Number.isInteger(partida) &&
                partida >= 1 &&
                partida <= 720
                    ? partida
                    : PADRAO.duracaoPartidaMinutos,

            temaAparencia:
                config.temaAparencia === "escuro"
                    ? "escuro"
                    : "claro"

        };

    }


    function lerLocal() {

        try {

            const dados =
                localStorage.getItem(CHAVE_LOCAL);

            return dados
                ? normalizar(JSON.parse(dados))
                : { ...PADRAO };

        } catch (erro) {

            console.warn(
                "Não foi possível ler as configurações locais:",
                erro
            );

            return { ...PADRAO };

        }

    }


    function salvarLocal(config) {

        try {

            localStorage.setItem(
                CHAVE_LOCAL,
                JSON.stringify(normalizar(config))
            );

            return true;

        } catch (erro) {

            console.warn(
                "Não foi possível salvar a cópia local das configurações:",
                erro
            );

            return false;

        }

    }


    function atualizarStatus(
        mensagem,
        tipo = "secondary"
    ) {

        const status =
            elemento("statusConfiguracoes");

        if (!status) {
            return;
        }

        status.textContent = mensagem;
        status.className = `badge bg-${tipo} fs-6`;

    }


    function aplicarTema(
        tema,
        origem = "configuracoes"
    ) {

        if (window.PeladaDaFeTema?.aplicar) {

            window.PeladaDaFeTema.aplicar(
                tema,
                { origem }
            );

        }

    }


    function preencherFormulario(configuracoes) {

        const config =
            normalizar(configuracoes);

        const campoPelada =
            elemento("duracaoPeladaPadrao");

        const campoPartida =
            elemento("duracaoPartidaPadrao");

        const campoTema =
            elemento("temaAparencia");


        if (campoPelada) {
            campoPelada.value = config.duracaoPeladaMinutos;
        }

        if (campoPartida) {
            campoPartida.value = config.duracaoPartidaMinutos;
        }

        if (campoTema) {
            campoTema.value = config.temaAparencia;
        }

        aplicarTema(
            config.temaAparencia,
            "configuracoes"
        );

        atualizarResumo();

    }


    function formatarMinutos(minutos) {

        return minutos === 1
            ? "1 minuto"
            : `${minutos} minutos`;

    }


    function atualizarResumo() {

        const campoPelada =
            elemento("duracaoPeladaPadrao");

        const campoPartida =
            elemento("duracaoPartidaPadrao");

        const resumoPelada =
            elemento("resumoDuracaoPelada");

        const resumoPartida =
            elemento("resumoDuracaoPartida");


        if (campoPelada && resumoPelada) {

            const valor =
                Number(campoPelada.value);

            resumoPelada.textContent =
                Number.isInteger(valor) &&
                valor >= 1 &&
                valor <= 720
                    ? formatarMinutos(valor)
                    : "Valor inválido";

        }


        if (campoPartida && resumoPartida) {

            const valor =
                Number(campoPartida.value);

            resumoPartida.textContent =
                Number.isInteger(valor) &&
                valor >= 1 &&
                valor <= 720
                    ? formatarMinutos(valor)
                    : "Valor inválido";

        }

    }


    function validarFormulario() {

        const campoPelada =
            elemento("duracaoPeladaPadrao");

        const campoPartida =
            elemento("duracaoPartidaPadrao");

        const campoTema =
            elemento("temaAparencia");


        if (
            !campoPelada ||
            !campoPartida ||
            !campoTema
        ) {

            return {
                valido: false,
                mensagem:
                    "Não foi possível localizar todos os campos de configuração."
            };

        }


        const pelada =
            Number(campoPelada.value);

        const partida =
            Number(campoPartida.value);


        if (
            !Number.isInteger(pelada) ||
            pelada < 1 ||
            pelada > 720
        ) {

            return {
                valido: false,
                mensagem:
                    "A duração da Pelada precisa ser um número inteiro entre 1 e 720 minutos."
            };

        }


        if (
            !Number.isInteger(partida) ||
            partida < 1 ||
            partida > 720
        ) {

            return {
                valido: false,
                mensagem:
                    "A duração da partida precisa ser um número inteiro entre 1 e 720 minutos."
            };

        }


        if (
            !["claro", "escuro"].includes(
                campoTema.value
            )
        ) {

            return {
                valido: false,
                mensagem:
                    "Selecione um tema de aparência válido."
            };

        }


        return {
            valido: true,

            configuracoes: {
                duracaoPeladaMinutos: pelada,
                duracaoPartidaMinutos: partida,
                temaAparencia: campoTema.value
            }
        };

    }


    async function lerResposta(resposta) {

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


    async function carregarDoServidor() {

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

        const dados =
            await lerResposta(resposta);


        if (!dados?.configuracoes) {

            throw new Error(
                "A resposta do servidor não contém as configurações esperadas."
            );

        }


        const config =
            normalizar(dados.configuracoes);

        salvarLocal(config);
        preencherFormulario(config);

        atualizarStatus(
            "Sincronizadas com servidor",
            "success"
        );

        console.log(
            "Configurações carregadas do MongoDB:",
            config
        );

    }


    async function salvarNoServidor(configuracoes) {

        const config =
            normalizar(configuracoes);

        // A cópia local mantém Partidas disponível mesmo se o servidor cair.
        const copiaLocalSalva =
            salvarLocal(config);

        // O tema muda imediatamente, antes mesmo de a requisição terminar.
        aplicarTema(
            config.temaAparencia,
            "salvamento"
        );


        try {

            const resposta =
                await fetch(
                    URL_API,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },

                        body: JSON.stringify(config)
                    }
                );

            const dados =
                await lerResposta(resposta);

            const salvas =
                normalizar(
                    dados?.configuracoes || config
                );

            salvarLocal(salvas);
            preencherFormulario(salvas);

            atualizarStatus(
                "Sincronizadas com servidor",
                "success"
            );

            console.log(
                "Configurações salvas no MongoDB:",
                salvas
            );

            return {
                sincronizado: true,
                localSalvo: copiaLocalSalva
            };

        } catch (erro) {

            console.error(
                "Não foi possível sincronizar as configurações com o servidor:",
                erro
            );

            atualizarStatus(
                copiaLocalSalva
                    ? "Salvas só neste navegador"
                    : "Falha ao salvar",

                copiaLocalSalva
                    ? "warning"
                    : "danger"
            );

            atualizarResumo();

            return {
                sincronizado: false,
                localSalvo: copiaLocalSalva,
                erro
            };

        }

    }


    async function mostrarAviso(
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

        alert(`${titulo}\n\n${mensagem}`);

    }


    function mostrarSucesso(mensagem) {

        if (typeof toast === "function") {

            toast(
                mensagem,
                "#198754"
            );

        } else if (typeof Swal !== "undefined") {

            Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: mensagem,
                timer: 2200,
                showConfirmButton: false
            });

        } else {

            console.log(mensagem);

        }

    }


    function definirSalvamento(emAndamento) {

        salvando = emAndamento;

        const botaoSalvar =
            elemento("btnSalvarConfiguracoes");

        const botaoRestaurar =
            elemento("btnRestaurarConfiguracoes");


        if (botaoSalvar) {

            botaoSalvar.disabled = emAndamento;

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
            botaoRestaurar.disabled = emAndamento;
        }

    }


    async function processarSalvamento(config) {

        if (salvando) {
            return;
        }

        definirSalvamento(true);

        try {

            const resultado =
                await salvarNoServidor(config);


            if (resultado.sincronizado) {

                mostrarSucesso(
                    "Configurações salvas e sincronizadas com o servidor!"
                );

            } else if (resultado.localSalvo) {

                await mostrarAviso(
                    "Salvas só neste navegador",

                    "Não foi possível sincronizar com o servidor. A cópia local foi atualizada; as alterações não serão compartilhadas com os outros dispositivos até que a conexão seja restabelecida e você salve novamente.",

                    "warning"
                );

            } else {

                await mostrarAviso(
                    "Falha ao salvar",

                    "Não foi possível gravar as configurações no servidor nem neste navegador. Verifique a conexão e tente novamente.",

                    "error"
                );

            }

        } finally {

            definirSalvamento(false);

        }

    }


    function configurarEventos() {

        const formulario =
            elemento("formConfiguracoes");

        const botaoRestaurar =
            elemento("btnRestaurarConfiguracoes");

        const campoPelada =
            elemento("duracaoPeladaPadrao");

        const campoPartida =
            elemento("duracaoPartidaPadrao");

        const campoTema =
            elemento("temaAparencia");


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


        if (campoTema) {

            campoTema.addEventListener(
                "change",
                () => {

                    // Pré-visualização imediata. Para sincronizar entre dispositivos,
                    // clique em Salvar configurações.
                    aplicarTema(
                        campoTema.value,
                        "usuario"
                    );

                }
            );

        }


        if (formulario) {

            formulario.addEventListener(
                "submit",
                async evento => {

                    evento.preventDefault();

                    if (salvando) {
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


        if (botaoRestaurar) {

            botaoRestaurar.addEventListener(
                "click",
                async () => {

                    if (salvando) {
                        return;
                    }

                    let confirmou = false;


                    if (typeof Swal !== "undefined") {

                        const resultado =
                            await Swal.fire({

                                icon: "question",

                                title: "Restaurar padrões?",

                                text:
                                    "Os tempos voltarão para 60 minutos por Pelada e 7 minutos por partida, e o tema voltará para Claro. As alterações serão enviadas ao servidor para uso nos demais dispositivos.",

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
                                "Restaurar os padrões: Pelada de 60 minutos, partida de 7 minutos e tema Claro?"
                            );

                    }


                    if (!confirmou) {
                        return;
                    }


                    preencherFormulario(PADRAO);

                    await processarSalvamento({
                        ...PADRAO
                    });

                }
            );

        }

    }


    async function inicializar() {

        configurarEventos();

        // Mostra a cópia local enquanto consulta o servidor.
        preencherFormulario(lerLocal());

        atualizarStatus(
            "Carregando configurações...",
            "secondary"
        );


        try {

            await carregarDoServidor();

        } catch (erro) {

            console.warn(
                "Servidor de configurações indisponível; utilizando a cópia local:",
                erro
            );

            preencherFormulario(lerLocal());

            atualizarStatus(
                localStorage.getItem(CHAVE_LOCAL)
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