(function () {

    class Partidas {

        constructor() {

            this.duracaoPelada = 60 * 60;
            this.duracaoPartida = 7 * 60;

            this.peladaIniciada = false;
            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.peladaFinalizada = false;
            this.resultadoPendente = false;

            this.salvandoResultado = false;

            this.chaveSessaoPersistida =
                "peladaDaFePartidasSessao";

            this.eventoPageHide = null;

            this.intervaloPelada = null;
            this.intervaloPartida = null;

            this.tempoRestantePelada = this.duracaoPelada;
            this.tempoRestantePartida = this.duracaoPartida;

            this.partidasRealizadas = 0;
            this.historico = [];

            this.peladaAtualId =
                localStorage.getItem(
                    "peladaDaFePeladaAtualId"
                ) || "";

            this.peladaDaSessaoId = null;
            this.peladaDaSessaoNome = null;

            /*
             * Identificação da Pelada vinculada ao sorteio.
             */
            this.sorteioPeladaId = null;
            this.sorteioValidoParaPelada = false;

            this.times = {
                amarelo: {
                    nome: "Amarelo",
                    jogadores: []
                },

                vermelho: {
                    nome: "Vermelho",
                    jogadores: []
                },

                azul: {
                    nome: "Azul",
                    jogadores: []
                }
            };

            this.filaTimes = [];

            this.time1 = null;
            this.time2 = null;
            this.proximoTime = null;

            this.golsPartida = {
                time1: {},
                time2: {}
            };

            this.eventosGolsPartida = {
                time1: [],
                time2: []
            };

            this.partidaBancoIdAtual = null;

            this.iniciadaEm = null;

            this.inicializar();
        }


        inicializar() {

            console.log("⚽ Módulo Partidas iniciado.");

            this.configurarEventos();

            this.obterPeladaAtualId();

            this.carregarTimesDoSorteio();

            this.eventoPageHide = () => {
                this.salvarSessaoPersistida();
            };

            window.addEventListener(
                "pagehide",
                this.eventoPageHide
            );

            const sessaoRestaurada =
                this.restaurarSessaoPersistida();

            if (sessaoRestaurada) {

                console.log(
                    "♻️ Sessão de Partidas restaurada com sucesso."
                );

                return;
            }

            this.atualizarTela();

            this.atualizarEstimativa();

            this.atualizarCronometroPelada();

            this.atualizarCronometroPartida();

            this.atualizarStatus(
                "Pelada não iniciada"
            );

            this.atualizarBadgePartida(
                "Aguardando",
                "bg-secondary"
            );

            this.atualizarBotoes();

        }


        criarSnapshotTimes() {

            const snapshot = {};

            Object.entries(this.times || {}).forEach(
                ([codigoTime, time]) => {

                    snapshot[codigoTime] = {
                        nome: time?.nome || codigoTime,

                        jogadores: Array.isArray(time?.jogadores)
                            ? time.jogadores.map(
                                (jogador, indice) => ({

                                    _id:
                                        this.obterIdJogador(
                                            jogador,
                                            indice
                                        ),

                                    nome:
                                        this.obterNomeJogador(
                                            jogador
                                        ),

                                    numeroCamisa:
                                        jogador?.numeroCamisa ??
                                        jogador?.numero ??
                                        ""

                                })
                            )
                            : []
                    };

                }
            );

            return snapshot;

        }


        salvarSessaoPersistida() {

            if (
                !this.peladaIniciada &&
                !this.resultadoPendente
            ) {
                return;
            }

            try {

                const snapshot = {
                    versao: 1,
                    salvoEm: Date.now(),

                    duracaoPelada:
                        this.duracaoPelada,

                    duracaoPartida:
                        this.duracaoPartida,

                    tempoRestantePelada:
                        this.tempoRestantePelada,

                    tempoRestantePartida:
                        this.tempoRestantePartida,

                    peladaIniciada:
                        this.peladaIniciada,

                    partidaIniciada:
                        this.partidaIniciada,

                    partidaPausada:
                        this.partidaPausada,

                    peladaFinalizada:
                        this.peladaFinalizada,

                    resultadoPendente:
                        this.resultadoPendente,

                    partidasRealizadas:
                        this.partidasRealizadas,

                    historico:
                        this.historico,

                    peladaDaSessaoId:
                        this.peladaDaSessaoId,

                    peladaDaSessaoNome:
                        this.peladaDaSessaoNome,

                    times:
                        this.criarSnapshotTimes(),

                    filaTimes:
                        Array.isArray(this.filaTimes)
                            ? [...this.filaTimes]
                            : [],

                    time1:
                        this.time1,

                    time2:
                        this.time2,

                    proximoTime:
                        this.proximoTime,

                    golsPartida:
                        this.golsPartida,

                    eventosGolsPartida:
                        this.eventosGolsPartida,

                    partidaBancoIdAtual:
                        this.partidaBancoIdAtual,

                    iniciadaEm:
                        this.iniciadaEm
                };

                localStorage.setItem(
                    this.chaveSessaoPersistida,
                    JSON.stringify(snapshot)
                );

            } catch (erro) {

                console.warn(
                    "⚠️ Não foi possível salvar a sessão de Partidas:",
                    erro
                );

            }

        }


        limparSessaoPersistida() {

            try {

                localStorage.removeItem(
                    this.chaveSessaoPersistida
                );

            } catch (erro) {

                console.warn(
                    "⚠️ Não foi possível limpar a sessão de Partidas:",
                    erro
                );

            }

        }


        restaurarSessaoPersistida() {

            let snapshot = null;

            try {

                const salvo =
                    localStorage.getItem(
                        this.chaveSessaoPersistida
                    );

                if (!salvo) {
                    return false;
                }

                snapshot = JSON.parse(salvo);

            } catch (erro) {

                console.warn(
                    "⚠️ A sessão salva estava inválida e será descartada:",
                    erro
                );

                this.limparSessaoPersistida();

                return false;

            }

            if (
                !snapshot ||
                Number(snapshot.versao || 0) !== 1 ||
                !snapshot.peladaDaSessaoId ||
                !this.ehObjectIdMongo(
                    snapshot.peladaDaSessaoId
                )
            ) {

                this.limparSessaoPersistida();

                return false;

            }

            if (
                !snapshot.peladaIniciada &&
                !snapshot.resultadoPendente
            ) {

                this.limparSessaoPersistida();

                return false;

            }

            const agora = Date.now();

            const salvoEm =
                Number(snapshot.salvoEm || agora);

            const segundosForaDaTela = Math.max(
                0,
                Math.floor(
                    (agora - salvoEm) / 1000
                )
            );

            this.duracaoPelada = Math.max(
                1,
                Number(
                    snapshot.duracaoPelada || 60 * 60
                )
            );

            this.duracaoPartida = Math.max(
                1,
                Number(
                    snapshot.duracaoPartida || 7 * 60
                )
            );

            this.tempoRestantePelada = Math.max(
                0,
                Number(
                    snapshot.tempoRestantePelada ??
                    this.duracaoPelada
                )
            );

            this.tempoRestantePartida = Math.max(
                0,
                Number(
                    snapshot.tempoRestantePartida ??
                    this.duracaoPartida
                )
            );

            this.peladaIniciada =
                Boolean(snapshot.peladaIniciada);

            this.partidaIniciada =
                Boolean(snapshot.partidaIniciada);

            this.partidaPausada =
                Boolean(snapshot.partidaPausada);

            this.peladaFinalizada =
                Boolean(snapshot.peladaFinalizada);

            this.resultadoPendente =
                Boolean(snapshot.resultadoPendente);

            this.salvandoResultado = false;

            this.partidasRealizadas = Math.max(
                0,
                Number(snapshot.partidasRealizadas || 0)
            );

            this.historico =
                Array.isArray(snapshot.historico)
                    ? snapshot.historico
                    : [];

            this.peladaDaSessaoId =
                String(snapshot.peladaDaSessaoId);

            this.peladaDaSessaoNome =
                snapshot.peladaDaSessaoNome ||
                "Pelada da Fé";

            if (
                snapshot.times &&
                typeof snapshot.times === "object"
            ) {

                Object.entries(snapshot.times).forEach(
                    ([codigoTime, dadosTime]) => {

                        if (!this.times[codigoTime]) {

                            this.times[codigoTime] = {
                                nome:
                                    dadosTime?.nome ||
                                    codigoTime,

                                jogadores: []
                            };

                        }

                        this.times[codigoTime].nome =
                            dadosTime?.nome ||
                            this.times[codigoTime].nome;

                        this.times[codigoTime].jogadores =
                            Array.isArray(dadosTime?.jogadores)
                                ? dadosTime.jogadores.map(
                                    jogador => ({

                                        _id:
                                            jogador?._id ||
                                            jogador?.id ||
                                            jogador?.codigo ||
                                            jogador?.nome ||
                                            "",

                                        nome:
                                            jogador?.nome ||
                                            jogador?.name ||
                                            "Jogador",

                                        numeroCamisa:
                                            jogador?.numeroCamisa ??
                                            jogador?.numero ??
                                            ""

                                    })
                                )
                                : [];

                    }
                );

            }

            this.filaTimes =
                Array.isArray(snapshot.filaTimes)
                    ? [...snapshot.filaTimes]
                    : [];

            this.time1 =
                snapshot.time1 || null;

            this.time2 =
                snapshot.time2 || null;

            this.proximoTime =
                snapshot.proximoTime || null;

            this.golsPartida =
                snapshot.golsPartida &&
                typeof snapshot.golsPartida === "object"
                    ? snapshot.golsPartida
                    : {
                        time1: {},
                        time2: {}
                    };

            this.eventosGolsPartida =
                snapshot.eventosGolsPartida &&
                typeof snapshot.eventosGolsPartida === "object"
                    ? snapshot.eventosGolsPartida
                    : {
                        time1: [],
                        time2: []
                    };

            this.partidaBancoIdAtual =
                snapshot.partidaBancoIdAtual || null;

            this.iniciadaEm =
                snapshot.iniciadaEm || null;

            /*
             * A Pelada continua contando durante a navegação.
             */
            if (
                this.peladaIniciada &&
                !this.peladaFinalizada
            ) {

                this.tempoRestantePelada = Math.max(
                    0,
                    this.tempoRestantePelada -
                    segundosForaDaTela
                );

            }

            /*
             * Uma partida pausada não perde tempo.
             */
            if (
                this.partidaIniciada &&
                !this.partidaPausada
            ) {

                this.tempoRestantePartida = Math.max(
                    0,
                    this.tempoRestantePartida -
                    segundosForaDaTela
                );

            }

            if (
                this.partidaIniciada &&
                this.tempoRestantePartida <= 0
            ) {

                this.tempoRestantePartida = 0;

                this.partidaIniciada = false;

                this.partidaPausada = false;

                this.resultadoPendente = true;

            }

            if (
                this.peladaIniciada &&
                this.tempoRestantePelada <= 0
            ) {

                this.tempoRestantePelada = 0;

                this.peladaIniciada = false;

                this.peladaFinalizada = true;

                if (this.partidaIniciada) {

                    this.partidaIniciada = false;

                    this.partidaPausada = false;

                    this.resultadoPendente = true;

                }

            }

            this.atualizarDuracoesNaTela();

            this.atualizarTela();

            this.atualizarEstimativa();

            this.atualizarCronometroPelada();

            this.atualizarCronometroPartida();

            this.renderizarHistorico();

            if (this.resultadoPendente) {

                this.renderizarAreaResultado();

                this.atualizarStatus(
                    this.peladaFinalizada
                        ? "Pelada finalizada - informe o resultado pendente"
                        : "Informe o resultado da partida"
                );

                this.atualizarBadgePartida(
                    "Resultado pendente",
                    "bg-warning text-dark"
                );

            } else if (this.partidaIniciada) {

                this.renderizarAreaResultado();

                this.atualizarStatus(
                    this.partidaPausada
                        ? "Partida pausada"
                        : "Partida em andamento"
                );

                this.atualizarBadgePartida(
                    this.partidaPausada
                        ? "Pausada"
                        : "Em andamento",

                    this.partidaPausada
                        ? "bg-warning text-dark"
                        : "bg-success"
                );

            } else if (this.peladaFinalizada) {

                this.atualizarStatus(
                    "Pelada finalizada"
                );

                this.atualizarBadgePartida(
                    "Pelada finalizada",
                    "bg-danger"
                );

            } else if (this.peladaIniciada) {

                this.atualizarStatus(
                    `Pelada iniciada: ${this.peladaDaSessaoNome}`
                );

                this.atualizarBadgePartida(
                    "Aguardando início",
                    "bg-secondary"
                );

            }

            this.atualizarBotoes();

            if (
                this.peladaFinalizada &&
                !this.resultadoPendente
            ) {

                this.limparSessaoPersistida();

                return true;

            }

            this.salvarSessaoPersistida();

            if (
                this.peladaIniciada &&
                !this.peladaFinalizada
            ) {

                this.iniciarCronometroPelada();

            }

            if (
                this.partidaIniciada &&
                !this.partidaPausada
            ) {

                this.iniciarCronometroPartida();

            }

            return true;

        }


        atualizarDuracoesNaTela() {

            const campoPelada =
                document.getElementById(
                    "duracaoPelada"
                );

            const campoPartida =
                document.getElementById(
                    "duracaoPartida"
                );

            if (campoPelada) {

                campoPelada.value = Math.max(
                    1,
                    Math.round(
                        this.duracaoPelada / 60
                    )
                );

            }

            if (campoPartida) {

                campoPartida.value = Math.max(
                    1,
                    Math.round(
                        this.duracaoPartida / 60
                    )
                );

            }

        }


        configurarEventos() {

            const btnIniciarPelada =
                document.getElementById(
                    "btnIniciarPelada"
                );

            const btnReiniciarPelada =
                document.getElementById(
                    "btnReiniciarPelada"
                );

            const btnIniciarPartida =
                document.getElementById(
                    "btnIniciarPartida"
                );

            const btnPausarPartida =
                document.getElementById(
                    "btnPausarPartida"
                );

            const btnFinalizarPartida =
                document.getElementById(
                    "btnFinalizarPartida"
                );

            const btnConfirmarResultado =
                document.getElementById(
                    "btnConfirmarResultado"
                );

            const duracaoPelada =
                document.getElementById(
                    "duracaoPelada"
                );

            const duracaoPartida =
                document.getElementById(
                    "duracaoPartida"
                );


            if (duracaoPelada) {

                duracaoPelada.addEventListener(
                    "input",
                    () => {

                        if (!this.peladaIniciada) {

                            this.tempoRestantePelada =
                                this.obterDuracaoPelada();

                            this.atualizarCronometroPelada();

                        }

                        this.atualizarEstimativa();

                    }
                );

            }


            if (duracaoPartida) {

                duracaoPartida.addEventListener(
                    "input",
                    () => {

                        if (!this.partidaIniciada) {

                            this.tempoRestantePartida =
                                this.obterDuracaoPartida();

                            this.atualizarCronometroPartida();

                        }

                        this.atualizarEstimativa();

                    }
                );

            }


            if (btnIniciarPelada) {

                btnIniciarPelada.addEventListener(
                    "click",
                    () => {
                        this.iniciarPelada();
                    }
                );

            }


            if (btnReiniciarPelada) {

                btnReiniciarPelada.addEventListener(
                    "click",
                    () => {
                        this.reiniciarPelada();
                    }
                );

            }


            if (btnIniciarPartida) {

                btnIniciarPartida.addEventListener(
                    "click",
                    () => {
                        this.iniciarPartida();
                    }
                );

            }


            if (btnPausarPartida) {

                btnPausarPartida.addEventListener(
                    "click",
                    () => {
                        this.pausarPartida();
                    }
                );

            }


            if (btnFinalizarPartida) {

                btnFinalizarPartida.addEventListener(
                    "click",
                    () => {
                        this.finalizarPartidaManual();
                    }
                );

            }


            if (btnConfirmarResultado) {

                btnConfirmarResultado.addEventListener(
                    "click",
                    () => {
                        this.confirmarResultado();
                    }
                );

            }


            const areaResultado =
                document.getElementById(
                    "areaResultado"
                );

            if (areaResultado) {

                areaResultado.addEventListener(
                    "click",
                    (evento) => {

                        const botao =
                            evento.target.closest(
                                "[data-acao-gol]"
                            );

                        if (!botao) {
                            return;
                        }

                        const acao =
                            botao.dataset.acaoGol;

                        const time =
                            botao.dataset.time;

                        const jogador =
                            botao.dataset.jogador;

                        if (!time || !jogador) {
                            return;
                        }

                        this.alterarGolJogador(
                            time,
                            jogador,
                            acao === "adicionar"
                                ? 1
                                : -1
                        );

                    }
                );

            }

        }


        obterPeladaAtualId() {

            const id =
                localStorage.getItem(
                    "peladaDaFePeladaAtualId"
                ) || "";

            this.peladaAtualId =
                String(id).trim();

            return this.peladaAtualId;

        }


        obterPeladaAtual() {

            const dados =
                localStorage.getItem(
                    "peladaDaFePeladaAtual"
                );

            if (!dados) {
                return null;
            }

            try {

                const pelada =
                    JSON.parse(dados);

                return pelada || null;

            } catch (erro) {

                console.warn(
                    "⚠️ Não foi possível ler os dados da Pelada atual:",
                    erro
                );

                return null;

            }

        }


        validarPeladaAtual() {

            const peladaId =
                this.obterPeladaAtualId();

            if (!peladaId) {

                this.mostrarErro(
                    "Selecione uma Pelada na tela Peladas antes de iniciar."
                );

                return false;

            }

            if (!this.ehObjectIdMongo(peladaId)) {

                this.mostrarErro(
                    "A Pelada selecionada possui um ID inválido."
                );

                return false;

            }

            const pelada =
                this.obterPeladaAtual();

            if (pelada) {

                const status =
                    String(
                        pelada.status || ""
                    ).trim();

                if (
                    status === "Finalizada" ||
                    status === "Cancelada"
                ) {

                    this.mostrarErro(
                        `A Pelada selecionada está com status "${status}" e não pode receber novas partidas.`
                    );

                    return false;

                }

            }

            return true;

        }


        iniciarVinculoPeladaSessao() {

            const peladaId =
                this.obterPeladaAtualId();

            const pelada =
                this.obterPeladaAtual();

            this.peladaDaSessaoId =
                peladaId || null;

            this.peladaDaSessaoNome =
                pelada?.nome ||
                "Pelada selecionada";

            console.log(
                "🏆 Pelada vinculada à sessão:",
                {
                    id: this.peladaDaSessaoId,
                    nome: this.peladaDaSessaoNome
                }
            );

        }


        /*
         * ALTERAÇÃO:
         * carrega os times somente quando o sorteio está associado
         * à Pelada atualmente selecionada.
         */
        carregarTimesDoSorteio() {

            this.times = {
                amarelo: {
                    nome: "Amarelo",
                    jogadores: []
                },

                vermelho: {
                    nome: "Vermelho",
                    jogadores: []
                },

                azul: {
                    nome: "Azul",
                    jogadores: []
                }
            };

            this.filaTimes = [];
            this.sorteioPeladaId = null;
            this.sorteioValidoParaPelada = false;

            try {

                const peladaAtualId =
                    this.obterPeladaAtualId();

                const sorteioPeladaId =
                    String(
                        localStorage.getItem(
                            "peladaDaFeTimesPeladaId"
                        ) || ""
                    ).trim();

                const dados =
                    localStorage.getItem(
                        "peladaDaFeTimes"
                    );

                if (!peladaAtualId) {

                    console.warn(
                        "⚠️ Não existe uma Pelada selecionada."
                    );

                    return false;

                }

                if (!dados) {

                    console.warn(
                        "⚠️ Nenhum sorteio foi encontrado."
                    );

                    return false;

                }

                if (!sorteioPeladaId) {

                    console.warn(
                        "⚠️ O sorteio salvo não está vinculado a uma Pelada."
                    );

                    return false;

                }

                if (sorteioPeladaId !== peladaAtualId) {

                    console.warn(
                        "⚠️ O sorteio pertence a outra Pelada.",
                        {
                            peladaSelecionada: peladaAtualId,
                            peladaDoSorteio: sorteioPeladaId
                        }
                    );

                    return false;

                }

                const times =
                    JSON.parse(dados);

                if (
                    !times ||
                    !times.amarelo ||
                    !times.vermelho ||
                    !times.azul
                ) {

                    console.warn(
                        "⚠️ Os dados do sorteio estão incompletos."
                    );

                    return false;

                }

                const jogadoresAmarelo =
                    Array.isArray(times.amarelo)
                        ? times.amarelo
                        : times.amarelo.jogadores;

                const jogadoresVermelho =
                    Array.isArray(times.vermelho)
                        ? times.vermelho
                        : times.vermelho.jogadores;

                const jogadoresAzul =
                    Array.isArray(times.azul)
                        ? times.azul
                        : times.azul.jogadores;

                if (
                    !Array.isArray(jogadoresAmarelo) ||
                    !Array.isArray(jogadoresVermelho) ||
                    !Array.isArray(jogadoresAzul)
                ) {

                    console.warn(
                        "⚠️ A lista de jogadores dos times está inválida."
                    );

                    return false;

                }

                this.times.amarelo.jogadores =
                    [...jogadoresAmarelo];

                this.times.vermelho.jogadores =
                    [...jogadoresVermelho];

                this.times.azul.jogadores =
                    [...jogadoresAzul];

                this.filaTimes = [
                    "amarelo",
                    "vermelho",
                    "azul"
                ];

                this.sorteioPeladaId =
                    sorteioPeladaId;

                this.sorteioValidoParaPelada =
                    true;

                console.log(
                    "✅ Sorteio validado para a Pelada selecionada:",
                    {
                        peladaId: peladaAtualId,
                        times: this.times
                    }
                );

                return true;

            } catch (erro) {

                console.error(
                    "❌ Não foi possível carregar os times do sorteio:",
                    erro
                );

                this.times = {
                    amarelo: {
                        nome: "Amarelo",
                        jogadores: []
                    },

                    vermelho: {
                        nome: "Vermelho",
                        jogadores: []
                    },

                    azul: {
                        nome: "Azul",
                        jogadores: []
                    }
                };

                this.filaTimes = [];
                this.sorteioPeladaId = null;
                this.sorteioValidoParaPelada = false;

                return false;

            }

        }


        /*
         * ALTERAÇÃO:
         * valida o vínculo antes de iniciar uma nova sessão.
         */
        validarSorteioParaPelada() {

            const peladaAtualId =
                this.obterPeladaAtualId();

            if (!peladaAtualId) {

                this.mostrarErro(
                    "Selecione uma Pelada na tela Peladas antes de iniciar."
                );

                return false;

            }

            const sorteioPeladaId =
                String(
                    localStorage.getItem(
                        "peladaDaFeTimesPeladaId"
                    ) || ""
                ).trim();

            if (!sorteioPeladaId) {

                this.mostrarErro(
                    "O sorteio salvo não está vinculado a uma Pelada. Selecione a Pelada desejada e gere um novo sorteio na tela Sorteio."
                );

                return false;

            }

            if (sorteioPeladaId !== peladaAtualId) {

                this.mostrarErro(
                    "O sorteio salvo pertence a outra Pelada. Acesse a tela Sorteio e gere um novo sorteio para a Pelada que está selecionada."
                );

                return false;

            }

            const sorteioCarregado =
                this.carregarTimesDoSorteio();

            if (
                !sorteioCarregado ||
                !this.sorteioValidoParaPelada ||
                this.filaTimes.length !== 3
            ) {

                this.mostrarErro(
                    "Não foi possível validar os três times para esta Pelada. Acesse Sorteio e gere um novo sorteio."
                );

                return false;

            }

            return true;

        }


        iniciarPelada() {

            if (this.peladaIniciada) {
                return;
            }

            if (!this.validarPeladaAtual()) {
                return;
            }

            /*
             * NOVO:
             * exige um sorteio pertencente à mesma Pelada.
             */
            if (!this.validarSorteioParaPelada()) {
                return;
            }

            const duracaoPelada =
                this.obterDuracaoPelada();

            const duracaoPartida =
                this.obterDuracaoPartida();

            if (
                duracaoPelada <= 0 ||
                duracaoPartida <= 0
            ) {

                this.mostrarErro(
                    "Informe tempos válidos para a pelada e para a partida."
                );

                return;
            }

            if (this.filaTimes.length < 3) {

                this.mostrarErro(
                    "É necessário ter os três times sorteados antes de iniciar a pelada."
                );

                return;
            }

            this.iniciarVinculoPeladaSessao();

            this.duracaoPelada =
                duracaoPelada;

            this.duracaoPartida =
                duracaoPartida;

            this.tempoRestantePelada =
                duracaoPelada;

            this.tempoRestantePartida =
                duracaoPartida;

            this.peladaIniciada = true;
            this.peladaFinalizada = false;
            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.resultadoPendente = false;
            this.salvandoResultado = false;

            this.partidasRealizadas = 0;
            this.historico = [];

            this.limparGolsPartida();

            this.iniciadaEm = null;

            this.filaTimes = [
                "amarelo",
                "vermelho",
                "azul"
            ];

            this.time1 =
                this.filaTimes.shift();

            this.time2 =
                this.filaTimes.shift();

            this.proximoTime =
                this.filaTimes.shift();

            this.atualizarStatus(
                `Pelada iniciada: ${this.peladaDaSessaoNome}`
            );

            this.atualizarBadgePartida(
                "Aguardando início",
                "bg-secondary"
            );

            this.iniciarCronometroPelada();

            this.atualizarTela();

            this.atualizarBotoes();

            this.salvarSessaoPersistida();

            console.log(
                "🏆 Pelada iniciada:",
                {
                    id: this.peladaDaSessaoId,
                    nome: this.peladaDaSessaoNome
                }
            );

        }


        iniciarCronometroPelada() {

            this.pararCronometroPelada();

            this.intervaloPelada =
                setInterval(
                    () => {

                        if (
                            !this.peladaIniciada ||
                            this.peladaFinalizada
                        ) {
                            return;
                        }

                        this.tempoRestantePelada--;

                        if (this.tempoRestantePelada <= 0) {

                            this.tempoRestantePelada = 0;

                            this.atualizarCronometroPelada();

                            this.salvarSessaoPersistida();

                            this.finalizarPelada(
                                "Tempo da pelada encerrado."
                            );

                            return;
                        }

                        this.atualizarCronometroPelada();

                        this.salvarSessaoPersistida();

                    },
                    1000
                );

        }


        pararCronometroPelada() {

            if (this.intervaloPelada) {

                clearInterval(
                    this.intervaloPelada
                );

                this.intervaloPelada = null;

            }

        }


        iniciarPartida() {

            if (!this.peladaIniciada) {

                this.mostrarErro(
                    "Primeiro inicie a pelada."
                );

                return;
            }

            if (this.peladaFinalizada) {

                this.mostrarErro(
                    "A pelada já foi finalizada."
                );

                return;
            }

            if (this.partidaIniciada) {
                return;
            }

            if (this.resultadoPendente) {

                this.mostrarErro(
                    "Confirme o resultado da partida anterior antes de iniciar uma nova."
                );

                return;
            }

            if (!this.time1 || !this.time2) {

                this.mostrarErro(
                    "Não existem dois times disponíveis para iniciar a partida."
                );

                return;
            }

            if (!this.peladaDaSessaoId) {

                this.mostrarErro(
                    "Não existe uma Pelada vinculada à sessão atual."
                );

                return;
            }

            if (this.tempoRestantePelada <= 0) {

                this.finalizarPelada(
                    "Tempo da pelada encerrado."
                );

                return;
            }

            this.tempoRestantePartida =
                Math.min(
                    this.obterDuracaoPartida(),
                    this.tempoRestantePelada
                );

            this.limparGolsPartida();

            this.iniciadaEm =
                new Date().toISOString();

            this.partidaIniciada = true;
            this.partidaPausada = false;
            this.resultadoPendente = false;
            this.salvandoResultado = false;

            this.atualizarStatus(
                "Partida em andamento"
            );

            this.atualizarBadgePartida(
                "Em andamento",
                "bg-success"
            );

            this.iniciarCronometroPartida();

            this.renderizarAreaResultado();

            this.atualizarBotoes();

            this.salvarSessaoPersistida();

            console.log(
                "⚽ Partida iniciada:",
                this.obterNomeTime(this.time1),
                "x",
                this.obterNomeTime(this.time2),
                "| Pelada:",
                this.peladaDaSessaoNome,
                "| ID:",
                this.peladaDaSessaoId
            );

        }


        iniciarCronometroPartida() {

            this.pararCronometroPartida();

            this.intervaloPartida =
                setInterval(
                    () => {

                        if (
                            !this.partidaIniciada ||
                            this.partidaPausada
                        ) {
                            return;
                        }

                        this.tempoRestantePartida--;

                        if (this.tempoRestantePartida <= 0) {

                            this.tempoRestantePartida = 0;

                            this.atualizarCronometroPartida();

                            this.salvarSessaoPersistida();

                            this.pararCronometroPartida();

                            this.finalizarPartidaPorTempo();

                            return;
                        }

                        this.atualizarCronometroPartida();

                        this.salvarSessaoPersistida();

                    },
                    1000
                );

        }


        pararCronometroPartida() {

            if (this.intervaloPartida) {

                clearInterval(
                    this.intervaloPartida
                );

                this.intervaloPartida = null;

            }

        }


        pausarPartida() {

            if (!this.partidaIniciada) {
                return;
            }

            this.partidaPausada =
                !this.partidaPausada;

            if (this.partidaPausada) {

                this.atualizarStatus(
                    "Partida pausada"
                );

                this.atualizarBadgePartida(
                    "Pausada",
                    "bg-warning text-dark"
                );

            } else {

                this.atualizarStatus(
                    "Partida em andamento"
                );

                this.atualizarBadgePartida(
                    "Em andamento",
                    "bg-success"
                );

            }

            this.atualizarBotoes();

            this.salvarSessaoPersistida();

        }


        finalizarPartidaManual() {

            if (!this.partidaIniciada) {
                return;
            }

            this.pararCronometroPartida();

            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.resultadoPendente = true;

            this.renderizarAreaResultado();

            this.atualizarStatus(
                "Informe o resultado da partida"
            );

            this.atualizarBadgePartida(
                "Aguardando resultado",
                "bg-warning text-dark"
            );

            this.atualizarBotoes();

            this.salvarSessaoPersistida();

        }


        finalizarPartidaPorTempo() {

            if (!this.partidaIniciada) {
                return;
            }

            this.pararCronometroPartida();

            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.resultadoPendente = true;

            this.renderizarAreaResultado();

            this.atualizarStatus(
                "Tempo encerrado - informe o resultado"
            );

            this.atualizarBadgePartida(
                "Tempo encerrado",
                "bg-danger"
            );

            this.atualizarBotoes();

            this.salvarSessaoPersistida();

        }


        limparGolsPartida() {

            this.golsPartida = {
                time1: {},
                time2: {}
            };

            this.eventosGolsPartida = {
                time1: [],
                time2: []
            };

            this.partidaBancoIdAtual = null;

        }


        alterarGolJogador(
            time,
            jogadorId,
            quantidade
        ) {

            if (!this.golsPartida[time]) {
                return;
            }

            const atual =
                Number(
                    this.golsPartida[time][jogadorId] || 0
                );

            if (quantidade > 0) {

                if (!this.ehObjectIdMongo(jogadorId)) {

                    this.mostrarErro(
                        "Este jogador não possui um ID válido do MongoDB."
                    );

                    return;
                }

                const jogadores =
                    this.obterJogadoresDoTime(
                        time === "time1"
                            ? this.time1
                            : this.time2
                    );

                const jogadorEncontrado =
                    jogadores.find(
                        (jogador, indice) =>
                            this.obterIdJogador(
                                jogador,
                                indice
                            ) === String(jogadorId)
                    );

                if (!jogadorEncontrado) {

                    this.mostrarErro(
                        "Não foi possível localizar o jogador selecionado."
                    );

                    return;
                }

                this.golsPartida[time][jogadorId] =
                    atual + quantidade;

                const duracaoAtual =
                    this.obterDuracaoPartida();

                const segundosDecorridos =
                    Math.max(
                        0,
                        duracaoAtual -
                        this.tempoRestantePartida
                    );

                const minuto =
                    Math.floor(
                        segundosDecorridos / 60
                    );

                this.eventosGolsPartida[time].push({

                    jogadorId:
                        String(jogadorId),

                    nomeJogador:
                        this.obterNomeJogador(
                            jogadorEncontrado
                        ),

                    time:
                        this.obterNomeTime(
                            time === "time1"
                                ? this.time1
                                : this.time2
                        ),

                    minuto,

                    salvo: false

                });

            } else if (quantidade < 0) {

                if (atual <= 0) {
                    return;
                }

                const eventos =
                    this.eventosGolsPartida[time] || [];

                let indiceEvento = -1;

                for (
                    let indice = eventos.length - 1;
                    indice >= 0;
                    indice--
                ) {

                    if (
                        String(
                            eventos[indice]?.jogadorId
                        ) === String(jogadorId) &&
                        !eventos[indice]?.salvo
                    ) {

                        indiceEvento = indice;
                        break;

                    }

                }

                if (indiceEvento >= 0) {

                    eventos.splice(
                        indiceEvento,
                        1
                    );

                }

                this.golsPartida[time][jogadorId] =
                    Math.max(
                        0,
                        atual + quantidade
                    );

            }

            this.renderizarAreaResultado();

            this.salvarSessaoPersistida();

        }


        obterJogadoresDoTime(
            codigoTime
        ) {

            if (
                !codigoTime ||
                !this.times[codigoTime]
            ) {
                return [];
            }

            const jogadores =
                this.times[codigoTime].jogadores;

            return Array.isArray(jogadores)
                ? jogadores
                : [];

        }


        obterIdJogador(
            jogador,
            indice
        ) {

            if (!jogador) {
                return String(indice);
            }

            return String(
                jogador._id ||
                jogador.id ||
                jogador.codigo ||
                jogador.matricula ||
                jogador.nome ||
                jogador.name ||
                indice
            );

        }


        ehObjectIdMongo(
            valor
        ) {

            return /^[a-fA-F0-9]{24}$/.test(
                String(valor || "")
            );

        }


        obterNomeJogador(
            jogador
        ) {

            if (!jogador) {
                return "Jogador";
            }

            return (
                jogador.nome ||
                jogador.name ||
                jogador.nomeCompleto ||
                "Jogador"
            );

        }


        obterNomeTime(
            codigoTime
        ) {

            if (!codigoTime) {
                return "Aguardando";
            }

            return (
                this.times[codigoTime]?.nome ||
                codigoTime
            );

        }


        calcularTotalGols(
            time
        ) {

            if (!this.golsPartida[time]) {
                return 0;
            }

            return Object.values(
                this.golsPartida[time]
            ).reduce(
                (total, gols) => (
                    total + Number(gols || 0)
                ),
                0
            );

        }


        obterGolsJogadores(
            time
        ) {

            if (!this.golsPartida[time]) {
                return [];
            }

            return Object.entries(
                this.golsPartida[time]
            )
                .filter(
                    ([, gols]) =>
                        Number(gols) > 0
                )
                .map(
                    ([jogador, gols]) => ({
                        jogador,
                        gols: Number(gols)
                    })
                );

        }


        obterGolsDetalhados(
            time
        ) {

            const resultado = [];

            const jogadores =
                this.obterJogadoresDoTime(
                    time === "time1"
                        ? this.time1
                        : this.time2
                );

            jogadores.forEach(
                (jogador, indice) => {

                    const id =
                        this.obterIdJogador(
                            jogador,
                            indice
                        );

                    const gols =
                        Number(
                            this.golsPartida[time]?.[id] || 0
                        );

                    if (gols > 0) {

                        resultado.push({

                            jogadorId: id,

                            jogadorNome:
                                this.obterNomeJogador(
                                    jogador
                                ),

                            gols

                        });

                    }

                }
            );

            return resultado;

        }


        async salvarGolsNoBanco(
            partidaId
        ) {

            if (!this.ehObjectIdMongo(partidaId)) {

                throw new Error(
                    "A partida salva não retornou um ID válido do MongoDB."
                );

            }

            const eventos = [
                ...(this.eventosGolsPartida.time1 || []),
                ...(this.eventosGolsPartida.time2 || [])
            ];

            const eventosPendentes =
                eventos.filter(
                    evento => !evento.salvo
                );

            if (!eventosPendentes.length) {
                return [];
            }

            const resultados = [];

            for (const evento of eventosPendentes) {

                if (
                    !this.ehObjectIdMongo(
                        evento.jogadorId
                    )
                ) {

                    throw new Error(
                        `O jogador "${evento.nomeJogador}" não possui um ID válido do MongoDB.`
                    );

                }

                const payload = {

                    partida: partidaId,

                    jogador: evento.jogadorId,

                    nomeJogador: evento.nomeJogador,

                    time: evento.time,

                    minuto: Number(
                        evento.minuto ?? 0
                    )

                };

                console.log(
                    "📤 Enviando gol para /api/gols:",
                    payload
                );

                const resposta =
                    await fetch(
                        "/api/gols",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(payload)
                        }
                    );

                let dados = null;

                try {

                    dados = await resposta.json();

                } catch (erro) {

                    dados = null;

                }

                if (!resposta.ok) {

                    const mensagem =
                        dados?.erro ||
                        dados?.message ||
                        "O servidor recusou o salvamento do gol.";

                    const detalhes =
                        dados?.detalhes
                            ? ` ${dados.detalhes}`
                            : "";

                    throw new Error(
                        mensagem + detalhes
                    );

                }

                evento.salvo = true;

                this.salvarSessaoPersistida();

                resultados.push(
                    dados?.gol || dados
                );

                console.log(
                    "✅ Gol salvo no MongoDB:",
                    dados?.gol || dados
                );

            }

            return resultados;

        }


        async confirmarResultado() {

            if (!this.resultadoPendente) {
                return;
            }

            if (this.salvandoResultado) {
                return;
            }

            if (!this.time1 || !this.time2) {
                return;
            }

            if (!this.peladaDaSessaoId) {

                this.mostrarErro(
                    "Não existe uma Pelada vinculada à sessão atual."
                );

                return;

            }

            const golsTime1 =
                this.calcularTotalGols("time1");

            const golsTime2 =
                this.calcularTotalGols("time2");

            if (golsTime1 === golsTime2) {

                this.mostrarMensagemResultado(
                    "O resultado não pode ser empate. Informe gols até que exista um vencedor.",
                    "danger"
                );

                return;
            }

            const time1Jogado = this.time1;
            const time2Jogado = this.time2;

            const vencedor =
                golsTime1 > golsTime2
                    ? time1Jogado
                    : time2Jogado;

            const perdedor =
                golsTime1 > golsTime2
                    ? time2Jogado
                    : time1Jogado;

            const proximoTimeAntesDaRotacao =
                this.proximoTime;

            const golsTime1Detalhados =
                this.obterGolsDetalhados("time1");

            const golsTime2Detalhados =
                this.obterGolsDetalhados("time2");

            const duracaoConfigurada =
                this.obterDuracaoPartida();

            const duracaoDecorrida =
                Math.max(
                    0,
                    duracaoConfigurada -
                    this.tempoRestantePartida
                );

            const registro = {

                numero:
                    this.partidasRealizadas + 1,

                peladaId:
                    this.peladaDaSessaoId,

                peladaNome:
                    this.peladaDaSessaoNome,

                time1:
                    time1Jogado,

                time2:
                    time2Jogado,

                golsTime1:
                    golsTime1,

                golsTime2:
                    golsTime2,

                gols: {
                    time1: golsTime1Detalhados,
                    time2: golsTime2Detalhados
                },

                vencedor:
                    vencedor,

                perdedor:
                    perdedor,

                proximo:
                    proximoTimeAntesDaRotacao,

                duracao:
                    duracaoDecorrida,

                iniciadaEm:
                    this.iniciadaEm,

                data:
                    new Date().toISOString()

            };

            this.salvandoResultado = true;

            this.atualizarBotoes();

            this.atualizarStatus(
                "Salvando resultado..."
            );

            this.atualizarBadgePartida(
                "Salvando...",
                "bg-info text-dark"
            );

            /*
             * Persiste o estado antes de iniciar operações assíncronas.
             */
            this.salvarSessaoPersistida();

            try {

                let partidaSalva = null;

                if (!this.partidaBancoIdAtual) {

                    partidaSalva =
                        await this.salvarPartidaNoBanco(
                            registro
                        );

                    this.partidaBancoIdAtual =
                        partidaSalva?._id ||
                        partidaSalva?.id ||
                        null;

                    this.salvarSessaoPersistida();

                    if (
                        !this.ehObjectIdMongo(
                            this.partidaBancoIdAtual
                        )
                    ) {

                        throw new Error(
                            "A partida foi salva, mas o servidor não retornou um ID válido."
                        );

                    }

                    console.log(
                        "✅ Partida salva no MongoDB:",
                        partidaSalva
                    );

                } else {

                    console.log(
                        "♻️ Reutilizando partida já salva:",
                        this.partidaBancoIdAtual
                    );

                }

                await this.salvarGolsNoBanco(
                    this.partidaBancoIdAtual
                );

                console.log(
                    "✅ Gols da partida sincronizados com o MongoDB."
                );

            } catch (erro) {

                console.error(
                    "❌ Erro ao salvar partida:",
                    erro
                );

                this.salvandoResultado = false;

                this.atualizarStatus(
                    "Erro ao salvar resultado"
                );

                this.atualizarBadgePartida(
                    "Erro ao salvar",
                    "bg-danger"
                );

                this.mostrarErro(
                    erro.message ||
                    "Não foi possível salvar a partida e os gols no banco de dados."
                );

                this.atualizarBotoes();

                this.salvarSessaoPersistida();

                return;

            }

            this.partidasRealizadas++;

            registro.numero =
                this.partidasRealizadas;

            this.historico.push(registro);

            const timeVencedor = vencedor;
            const timePerdedor = perdedor;

            const proximo =
                proximoTimeAntesDaRotacao;

            this.time1 = timeVencedor;
            this.time2 = proximo;

            if (timePerdedor) {
                this.filaTimes.push(timePerdedor);
            }

            this.proximoTime =
                this.filaTimes.shift();

            this.resultadoPendente = false;
            this.salvandoResultado = false;
            this.iniciadaEm = null;

            this.limparGolsPartida();

            this.ocultarAreaResultado();

            this.atualizarStatus(
                `Vitória do ${this.obterNomeTime(vencedor)}`
            );

            this.atualizarBadgePartida(
                "Resultado confirmado",
                "bg-success"
            );

            this.atualizarTela();

            this.renderizarHistorico();

            this.atualizarBotoes();

            const nomeTime1Jogado =
                this.obterNomeTime(time1Jogado);

            const nomeTime2Jogado =
                this.obterNomeTime(time2Jogado);

            const nomeVencedor =
                this.obterNomeTime(vencedor);

            this.mostrarMensagemResultado(
                `Vitória do ${nomeVencedor} por ${golsTime1} x ${golsTime2}.`,
                "success"
            );

            if (
                this.peladaFinalizada ||
                !this.peladaIniciada
            ) {

                this.limparSessaoPersistida();

            } else {

                this.salvarSessaoPersistida();

            }

            console.log(
                "🏆 Resultado:",
                nomeTime1Jogado,
                golsTime1,
                "x",
                golsTime2,
                nomeTime2Jogado,
                "| Vencedor:",
                nomeVencedor,
                "| Pelada:",
                this.peladaDaSessaoNome,
                "| Pelada ID:",
                this.peladaDaSessaoId
            );

        }


        async salvarPartidaNoBanco(
            registro
        ) {

            const peladaId =
                this.peladaDaSessaoId;

            if (!this.ehObjectIdMongo(peladaId)) {

                throw new Error(
                    "A partida não pode ser salva porque a Pelada vinculada possui um ID inválido."
                );

            }

            const jogadoresTimeA =
                this.obterJogadoresDoTime(
                    registro.time1
                );

            const jogadoresTimeB =
                this.obterJogadoresDoTime(
                    registro.time2
                );

            const idsTimeA =
                jogadoresTimeA
                    .map(
                        (jogador, indice) =>
                            this.obterIdJogador(
                                jogador,
                                indice
                            )
                    )
                    .filter(
                        id => this.ehObjectIdMongo(id)
                    );

            const idsTimeB =
                jogadoresTimeB
                    .map(
                        (jogador, indice) =>
                            this.obterIdJogador(
                                jogador,
                                indice
                            )
                    )
                    .filter(
                        id => this.ehObjectIdMongo(id)
                    );

            const payload = {

                pelada:
                    peladaId,

                nomeTimeA:
                    this.obterNomeTime(
                        registro.time1
                    ),

                nomeTimeB:
                    this.obterNomeTime(
                        registro.time2
                    ),

                jogadoresTimeA:
                    idsTimeA,

                jogadoresTimeB:
                    idsTimeB,

                golsTimeA:
                    Number(registro.golsTime1 || 0),

                golsTimeB:
                    Number(registro.golsTime2 || 0),

                vencedor:
                    registro.golsTime1 >
                    registro.golsTime2
                        ? "timeA"
                        : "timeB",

                numero:
                    Number(registro.numero),

                duracaoSegundos:
                    Number(registro.duracao || 0),

                iniciadaEm:
                    registro.iniciadaEm ||
                    this.iniciadaEm ||
                    null,

                finalizadaEm:
                    registro.data ||
                    new Date().toISOString(),

                finalizada: true

            };

            console.log(
                "📤 Enviando partida para /api/partidas:",
                payload
            );

            const resposta =
                await fetch(
                    "/api/partidas",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );

            let dados = null;

            try {

                dados = await resposta.json();

            } catch (erro) {

                dados = null;

            }

            if (!resposta.ok) {

                const mensagem =
                    dados?.erro ||
                    dados?.message ||
                    "O servidor recusou o salvamento da partida.";

                const detalhes =
                    dados?.detalhes
                        ? ` ${dados.detalhes}`
                        : "";

                throw new Error(
                    mensagem + detalhes
                );

            }

            return (
                dados?.partida ||
                dados
            );

        }


        renderizarAreaResultado() {

            const area =
                document.getElementById(
                    "areaResultado"
                );

            if (!area) {
                return;
            }

            area.classList.remove("d-none");

            const nomeTime1 =
                this.obterNomeTime(this.time1);

            const nomeTime2 =
                this.obterNomeTime(this.time2);

            const golsTime1 =
                this.calcularTotalGols("time1");

            const golsTime2 =
                this.calcularTotalGols("time2");

            const placarNomeTime1 =
                document.getElementById("placarNomeTime1");

            const placarNomeTime2 =
                document.getElementById("placarNomeTime2");

            const tituloGolsTime1 =
                document.getElementById("tituloGolsTime1");

            const tituloGolsTime2 =
                document.getElementById("tituloGolsTime2");

            const placarTime1 =
                document.getElementById("placarTime1");

            const placarTime2 =
                document.getElementById("placarTime2");

            if (placarNomeTime1) {
                placarNomeTime1.textContent = nomeTime1;
            }

            if (placarNomeTime2) {
                placarNomeTime2.textContent = nomeTime2;
            }

            if (tituloGolsTime1) {
                tituloGolsTime1.textContent = nomeTime1;
            }

            if (tituloGolsTime2) {
                tituloGolsTime2.textContent = nomeTime2;
            }

            if (placarTime1) {
                placarTime1.textContent = golsTime1;
            }

            if (placarTime2) {
                placarTime2.textContent = golsTime2;
            }

            this.renderizarListaGols(
                "time1",
                "listaGolsTime1"
            );

            this.renderizarListaGols(
                "time2",
                "listaGolsTime2"
            );

            const btnConfirmarResultado =
                document.getElementById(
                    "btnConfirmarResultado"
                );

            if (btnConfirmarResultado) {

                btnConfirmarResultado.disabled =
                    !this.resultadoPendente ||
                    this.salvandoResultado;

            }

            const mensagem =
                document.getElementById(
                    "mensagemResultado"
                );

            if (mensagem) {

                mensagem.classList.remove("d-none");

                if (golsTime1 === golsTime2) {

                    mensagem.className =
                        "alert alert-warning mt-4 mb-0";

                    mensagem.innerHTML = `
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        O placar está empatado.
                        <strong>Não é permitido empate.</strong>
                        Informe os gols até existir um vencedor.
                    `;

                } else {

                    const vencedor =
                        golsTime1 > golsTime2
                            ? nomeTime1
                            : nomeTime2;

                    mensagem.className =
                        "alert alert-success mt-4 mb-0";

                    mensagem.innerHTML = `
                        <i class="bi bi-trophy-fill me-2"></i>
                        Vencedor atual:
                        <strong>${this.escaparHtml(vencedor)}</strong>
                        por
                        <strong>${golsTime1} x ${golsTime2}</strong>.
                    `;

                }

            }

        }


        renderizarListaGols(
            time,
            elementoId
        ) {

            const elemento =
                document.getElementById(elementoId);

            if (!elemento) {
                return;
            }

            const jogadores =
                this.obterJogadoresDoTime(
                    time === "time1"
                        ? this.time1
                        : this.time2
                );

            if (!jogadores.length) {

                elemento.innerHTML = `
                    <div class="text-muted text-center py-3">
                        Nenhum jogador encontrado.
                    </div>
                `;

                return;

            }

            elemento.innerHTML =
                jogadores
                    .map(
                        (jogador, indice) => {

                            const id =
                                this.obterIdJogador(
                                    jogador,
                                    indice
                                );

                            const nome =
                                this.obterNomeJogador(jogador);

                            const gols =
                                Number(
                                    this.golsPartida[time]?.[id] || 0
                                );

                            return `
                                <div
                                    class="border rounded p-2 d-flex align-items-center justify-content-between gap-2"
                                >

                                    <div
                                        class="flex-grow-1 text-truncate"
                                        title="${this.escaparHtml(nome)}"
                                    >

                                        <i class="bi bi-person-fill me-1"></i>

                                        <span>
                                            ${this.escaparHtml(nome)}
                                        </span>

                                    </div>

                                    <div
                                        class="d-flex align-items-center gap-2"
                                    >

                                        <button
                                            type="button"
                                            class="btn btn-sm btn-outline-danger"
                                            data-acao-gol="remover"
                                            data-time="${this.escaparHtml(time)}"
                                            data-jogador="${this.escaparHtml(id)}"
                                            ${gols <= 0 ? "disabled" : ""}
                                        >
                                            <i class="bi bi-dash-lg"></i>
                                        </button>

                                        <span
                                            class="fw-bold text-center"
                                            style="min-width: 28px;"
                                        >
                                            ${gols}
                                        </span>

                                        <button
                                            type="button"
                                            class="btn btn-sm btn-outline-success"
                                            data-acao-gol="adicionar"
                                            data-time="${this.escaparHtml(time)}"
                                            data-jogador="${this.escaparHtml(id)}"
                                        >
                                            <i class="bi bi-plus-lg"></i>
                                        </button>

                                    </div>

                                </div>
                            `;

                        }
                    )
                    .join("");

        }


        ocultarAreaResultado() {

            const area =
                document.getElementById("areaResultado");

            if (area) {
                area.classList.add("d-none");
            }

        }


        mostrarMensagemResultado(
            mensagem,
            tipo = "info"
        ) {

            const elemento =
                document.getElementById(
                    "mensagemResultado"
                );

            if (!elemento) {
                return;
            }

            elemento.className =
                `alert alert-${tipo} mt-4 mb-0`;

            elemento.classList.remove("d-none");

            elemento.innerHTML = mensagem;

        }


        atualizarEstimativa() {

            const elemento =
                document.getElementById(
                    "partidasEstimadas"
                );

            if (!elemento) {
                return;
            }

            const total =
                this.obterDuracaoPelada();

            const partida =
                this.obterDuracaoPartida();

            if (
                total <= 0 ||
                partida <= 0
            ) {

                elemento.textContent = "—";

                return;

            }

            elemento.textContent =
                Math.floor(total / partida);

        }


        obterDuracaoPelada() {

            const elemento =
                document.getElementById(
                    "duracaoPelada"
                );

            const minutos =
                Number(elemento?.value || 60);

            if (
                !Number.isFinite(minutos) ||
                minutos <= 0
            ) {
                return 0;
            }

            return Math.round(minutos * 60);

        }


        obterDuracaoPartida() {

            const elemento =
                document.getElementById(
                    "duracaoPartida"
                );

            const minutos =
                Number(elemento?.value || 7);

            if (
                !Number.isFinite(minutos) ||
                minutos <= 0
            ) {
                return 0;
            }

            return Math.round(minutos * 60);

        }


        atualizarCronometroPelada() {

            const elemento =
                document.getElementById(
                    "tempoRestantePelada"
                );

            if (elemento) {

                elemento.textContent =
                    this.formatarTempo(
                        this.tempoRestantePelada
                    );

            }

        }


        atualizarCronometroPartida() {

            const elementos = [
                document.getElementById(
                    "tempoRestantePartida"
                ),

                document.getElementById(
                    "cronometroPartida"
                )
            ];

            elementos.forEach(
                elemento => {

                    if (elemento) {

                        elemento.textContent =
                            this.formatarTempo(
                                this.tempoRestantePartida
                            );

                    }

                }
            );

        }


        formatarTempo(
            segundos
        ) {

            segundos =
                Math.max(
                    0,
                    Math.floor(segundos)
                );

            const horas =
                Math.floor(segundos / 3600);

            const minutos =
                Math.floor(
                    (segundos % 3600) / 60
                );

            const segundosRestantes =
                segundos % 60;

            if (horas > 0) {

                return (
                    String(horas).padStart(2, "0") +
                    ":" +
                    String(minutos).padStart(2, "0") +
                    ":" +
                    String(segundosRestantes).padStart(2, "0")
                );

            }

            return (
                String(minutos).padStart(2, "0") +
                ":" +
                String(segundosRestantes).padStart(2, "0")
            );

        }


        atualizarStatus(
            texto
        ) {

            const elemento =
                document.getElementById(
                    "statusPartida"
                );

            if (elemento) {
                elemento.textContent = texto;
            }

        }


        atualizarBadgePartida(
            texto,
            classe
        ) {

            const elemento =
                document.getElementById(
                    "badgePartidaStatus"
                );

            if (!elemento) {
                return;
            }

            elemento.textContent = texto;

            elemento.className =
                `badge px-3 py-2 ${classe}`;

        }


        atualizarTela() {

            const proximoTime =
                document.getElementById(
                    "proximoTime"
                );

            if (proximoTime) {

                proximoTime.textContent =
                    this.obterNomeTime(
                        this.proximoTime
                    );

            }

            const nomeTime1 =
                document.getElementById(
                    "nomeTimePartida1"
                );

            if (nomeTime1) {

                nomeTime1.textContent =
                    this.obterNomeTime(
                        this.time1
                    );

            }

            const nomeTime2 =
                document.getElementById(
                    "nomeTimePartida2"
                );

            if (nomeTime2) {

                nomeTime2.textContent =
                    this.obterNomeTime(
                        this.time2
                    );

            }

            this.renderizarJogadoresTela(
                this.time1,
                "jogadoresTimePartida1"
            );

            this.renderizarJogadoresTela(
                this.time2,
                "jogadoresTimePartida2"
            );

            const numeroPartida =
                document.getElementById(
                    "numeroPartida"
                );

            if (numeroPartida) {

                numeroPartida.textContent =
                    this.partidasRealizadas + 1;

            }

            const partidasRealizadas =
                document.getElementById(
                    "partidasRealizadas"
                );

            if (partidasRealizadas) {

                partidasRealizadas.textContent =
                    this.partidasRealizadas;

            }

            this.atualizarCronometroPelada();

            this.atualizarCronometroPartida();

            this.renderizarHistorico();

        }


        renderizarJogadoresTela(
            codigoTime,
            elementoId
        ) {

            const elemento =
                document.getElementById(elementoId);

            if (!elemento) {
                return;
            }

            const jogadores =
                this.obterJogadoresDoTime(codigoTime);

            if (!jogadores.length) {

                elemento.innerHTML = `
                    <div class="text-muted">
                        Nenhum jogador cadastrado.
                    </div>
                `;

                return;

            }

            elemento.innerHTML = `
                <div class="d-flex flex-column gap-1">
                    ${
                        jogadores.map(
                            jogador => `
                                <div>
                                    <i class="bi bi-person me-1"></i>
                                    ${this.escaparHtml(
                                        this.obterNomeJogador(jogador)
                                    )}
                                </div>
                            `
                        ).join("")
                    }
                </div>
            `;

        }


        renderizarHistorico() {

            const elemento =
                document.getElementById(
                    "historicoPartidas"
                );

            if (!elemento) {
                return;
            }

            const badgeHistorico =
                document.getElementById(
                    "badgeHistorico"
                );

            if (badgeHistorico) {

                badgeHistorico.textContent =
                    `${this.historico.length} ${
                        this.historico.length === 1
                            ? "partida"
                            : "partidas"
                    }`;

            }

            if (!this.historico.length) {

                elemento.innerHTML = `
                    <tr>
                        <td
                            colspan="7"
                            class="text-center text-muted py-4"
                        >
                            <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                            Nenhuma partida registrada ainda.
                        </td>
                    </tr>
                `;

                return;

            }

            elemento.innerHTML =
                this.historico.map(
                    partida => {

                        const nomeTime1 =
                            this.obterNomeTime(
                                partida.time1
                            );

                        const nomeTime2 =
                            this.obterNomeTime(
                                partida.time2
                            );

                        const nomeVencedor =
                            this.obterNomeTime(
                                partida.vencedor
                            );

                        const placar =
                            `${partida.golsTime1} x ${partida.golsTime2}`;

                        const data =
                            this.formatarData(
                                partida.data
                            );

                        const duracao =
                            this.formatarTempo(
                                partida.duracao
                            );

                        return `
                            <tr>

                                <td>
                                    <strong>${partida.numero}</strong>
                                </td>

                                <td>
                                    ${this.escaparHtml(nomeTime1)}
                                </td>

                                <td class="text-center">
                                    <span class="badge bg-dark fs-6">
                                        ${placar}
                                    </span>
                                </td>

                                <td>
                                    ${this.escaparHtml(nomeTime2)}
                                </td>

                                <td>
                                    <span class="badge bg-success">
                                        <i class="bi bi-trophy-fill me-1"></i>
                                        ${this.escaparHtml(nomeVencedor)}
                                    </span>
                                </td>

                                <td>
                                    ${duracao}
                                </td>

                                <td>
                                    ${data}
                                </td>

                            </tr>
                        `;

                    }
                ).join("");

        }


        formatarData(
            data
        ) {

            if (!data) {
                return "—";
            }

            try {

                return new Date(data).toLocaleString("pt-BR");

            } catch (erro) {

                return "—";

            }

        }


        reiniciarPelada() {

            const confirmar =
                window.confirm(
                    "Deseja realmente reiniciar a pelada? O histórico exibido será perdido."
                );

            if (!confirmar) {
                return;
            }

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            this.peladaIniciada = false;
            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.peladaFinalizada = false;
            this.resultadoPendente = false;
            this.salvandoResultado = false;

            this.partidasRealizadas = 0;
            this.historico = [];

            this.tempoRestantePelada =
                this.obterDuracaoPelada();

            this.tempoRestantePartida =
                this.obterDuracaoPartida();

            this.limparGolsPartida();

            this.carregarTimesDoSorteio();

            this.filaTimes = [
                "amarelo",
                "vermelho",
                "azul"
            ];

            this.time1 = null;
            this.time2 = null;
            this.proximoTime = null;

            this.iniciadaEm = null;

            this.peladaDaSessaoId = null;
            this.peladaDaSessaoNome = null;

            this.ocultarAreaResultado();

            this.atualizarStatus(
                "Pelada não iniciada"
            );

            this.atualizarBadgePartida(
                "Aguardando",
                "bg-secondary"
            );

            this.atualizarTela();

            this.atualizarBotoes();

            this.limparSessaoPersistida();

            console.log(
                "🔄 Pelada reiniciada."
            );

        }


        finalizarPelada(
            mensagem
        ) {

            const partidaEstavaEmAndamento =
                this.partidaIniciada;

            const jaHaviaResultadoPendente =
                this.resultadoPendente;

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            this.peladaFinalizada = true;
            this.peladaIniciada = false;
            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.salvandoResultado = false;

            /*
             * Se o tempo acabar durante uma partida, preserva
             * o resultado para que possa ser confirmado.
             */
            this.resultadoPendente = Boolean(
                partidaEstavaEmAndamento ||
                jaHaviaResultadoPendente
            );

            this.atualizarStatus(
                this.resultadoPendente
                    ? "Pelada finalizada - informe o resultado pendente"
                    : (mensagem || "Pelada finalizada")
            );

            this.atualizarBadgePartida(
                this.resultadoPendente
                    ? "Resultado pendente"
                    : "Pelada finalizada",

                this.resultadoPendente
                    ? "bg-warning text-dark"
                    : "bg-danger"
            );

            this.atualizarCronometroPelada();

            if (this.resultadoPendente) {

                this.renderizarAreaResultado();

                this.salvarSessaoPersistida();

            } else {

                this.limparSessaoPersistida();

                this.ocultarAreaResultado();

            }

            this.atualizarBotoes();

            console.log(
                "🏁 Pelada finalizada.",
                {
                    id: this.peladaDaSessaoId,
                    nome: this.peladaDaSessaoNome,
                    resultadoPendente: this.resultadoPendente
                }
            );

        }


        atualizarBotoes() {

            const btnIniciarPelada =
                document.getElementById(
                    "btnIniciarPelada"
                );

            const btnReiniciarPelada =
                document.getElementById(
                    "btnReiniciarPelada"
                );

            const btnIniciarPartida =
                document.getElementById(
                    "btnIniciarPartida"
                );

            const btnPausarPartida =
                document.getElementById(
                    "btnPausarPartida"
                );

            const btnFinalizarPartida =
                document.getElementById(
                    "btnFinalizarPartida"
                );

            const btnConfirmarResultado =
                document.getElementById(
                    "btnConfirmarResultado"
                );

            if (btnIniciarPelada) {

                btnIniciarPelada.disabled =
                    this.peladaIniciada ||
                    this.peladaFinalizada;

            }

            if (btnReiniciarPelada) {

                btnReiniciarPelada.disabled = false;

            }

            if (btnIniciarPartida) {

                btnIniciarPartida.disabled =
                    !this.peladaIniciada ||
                    this.peladaFinalizada ||
                    this.partidaIniciada ||
                    this.resultadoPendente ||
                    this.salvandoResultado;

            }

            if (btnPausarPartida) {

                btnPausarPartida.disabled =
                    !this.partidaIniciada;

                if (this.partidaPausada) {

                    btnPausarPartida.innerHTML = `
                        <i class="bi bi-play-fill me-1"></i>
                        Retomar
                    `;

                } else {

                    btnPausarPartida.innerHTML = `
                        <i class="bi bi-pause-fill me-1"></i>
                        Pausar
                    `;

                }

            }

            if (btnFinalizarPartida) {

                btnFinalizarPartida.disabled =
                    !this.partidaIniciada;

            }

            if (btnConfirmarResultado) {

                btnConfirmarResultado.disabled =
                    !this.resultadoPendente ||
                    this.salvandoResultado;

                if (this.salvandoResultado) {

                    btnConfirmarResultado.innerHTML = `
                        <span
                            class="spinner-border spinner-border-sm me-2"
                            role="status"
                        ></span>
                        Salvando...
                    `;

                } else {

                    btnConfirmarResultado.innerHTML = `
                        <i class="bi bi-check-circle-fill me-1"></i>
                        Confirmar Resultado
                    `;

                }

            }

        }


        escaparHtml(
            valor
        ) {

            const div =
                document.createElement("div");

            div.textContent =
                valor ?? "";

            return div.innerHTML;

        }


        mostrarErro(
            mensagem
        ) {

            console.error(mensagem);

            if (typeof toast === "function") {

                toast(
                    mensagem,
                    "#dc3545"
                );

                return;

            }

            if (typeof Swal !== "undefined") {

                Swal.fire({
                    icon: "error",
                    title: "Atenção",
                    text: mensagem
                });

                return;

            }

            alert(mensagem);

        }


        destroy() {

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            this.salvarSessaoPersistida();

            if (this.eventoPageHide) {

                window.removeEventListener(
                    "pagehide",
                    this.eventoPageHide
                );

                this.eventoPageHide = null;

            }

            console.log(
                "🧹 Módulo Partidas destruído; sessão salva quando ativa."
            );

        }

    }


    window.Partidas =
        new Partidas();

})();