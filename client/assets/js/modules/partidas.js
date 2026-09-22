(function () {

    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: CONTROLE DE PARTIDAS
    // ============================================================

    class Partidas {

        constructor() {

            // ----------------------------------------------------
            // CONFIGURAÇÕES
            // ----------------------------------------------------

            this.duracaoPelada = 60 * 60;
            this.duracaoPartida = 7 * 60;

            // ----------------------------------------------------
            // ESTADO DA PELADA
            // ----------------------------------------------------

            this.peladaIniciada = false;
            this.partidaIniciada = false;
            this.partidaPausada = false;
            this.peladaFinalizada = false;
            this.resultadoPendente = false;

            // Evita dois cliques no botão de confirmar
            this.salvandoResultado = false;

            // ----------------------------------------------------
            // CRONÔMETROS
            // ----------------------------------------------------

            this.intervaloPelada = null;
            this.intervaloPartida = null;

            this.tempoRestantePelada = this.duracaoPelada;
            this.tempoRestantePartida = this.duracaoPartida;

            // ----------------------------------------------------
            // PARTIDAS
            // ----------------------------------------------------

            this.partidasRealizadas = 0;
            this.historico = [];

            // ----------------------------------------------------
            // TIMES
            // ----------------------------------------------------

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

            // ----------------------------------------------------
            // FILA
            // ----------------------------------------------------

            this.filaTimes = [];

            this.time1 = null;
            this.time2 = null;
            this.proximoTime = null;

            // ----------------------------------------------------
            // GOLS DA PARTIDA ATUAL
            // ----------------------------------------------------

            this.golsPartida = {
                time1: {},
                time2: {}
            };

            // ----------------------------------------------------
            // CONTROLE DA PARTIDA ATUAL
            // ----------------------------------------------------

            this.iniciadaEm = null;

            // ----------------------------------------------------
            // INICIALIZAÇÃO
            // ----------------------------------------------------

            this.inicializar();
        }


        // ========================================================
        // INICIALIZAR
        // ========================================================

        inicializar() {

            console.log("⚽ Módulo Partidas iniciado.");

            this.configurarEventos();

            this.carregarTimesDoSorteio();

            this.atualizarTela();

            this.atualizarEstimativa();

            this.atualizarCronometroPelada();

            this.atualizarCronometroPartida();

            this.atualizarStatus("Pelada não iniciada");

            this.atualizarBadgePartida(
                "Aguardando",
                "bg-secondary"
            );

            this.atualizarBotoes();
        }


        // ========================================================
        // EVENTOS
        // ========================================================

        configurarEventos() {

            const btnIniciarPelada =
                document.getElementById("btnIniciarPelada");

            const btnReiniciarPelada =
                document.getElementById("btnReiniciarPelada");

            const btnIniciarPartida =
                document.getElementById("btnIniciarPartida");

            const btnPausarPartida =
                document.getElementById("btnPausarPartida");

            const btnFinalizarPartida =
                document.getElementById("btnFinalizarPartida");

            const btnConfirmarResultado =
                document.getElementById("btnConfirmarResultado");

            const duracaoPelada =
                document.getElementById("duracaoPelada");

            const duracaoPartida =
                document.getElementById("duracaoPartida");


            // ----------------------------------------------------
            // DURAÇÃO DA PELADA
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // DURAÇÃO DA PARTIDA
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // INICIAR PELADA
            // ----------------------------------------------------

            if (btnIniciarPelada) {

                btnIniciarPelada.addEventListener(
                    "click",
                    () => {
                        this.iniciarPelada();
                    }
                );

            }


            // ----------------------------------------------------
            // REINICIAR PELADA
            // ----------------------------------------------------

            if (btnReiniciarPelada) {

                btnReiniciarPelada.addEventListener(
                    "click",
                    () => {
                        this.reiniciarPelada();
                    }
                );

            }


            // ----------------------------------------------------
            // INICIAR PARTIDA
            // ----------------------------------------------------

            if (btnIniciarPartida) {

                btnIniciarPartida.addEventListener(
                    "click",
                    () => {
                        this.iniciarPartida();
                    }
                );

            }


            // ----------------------------------------------------
            // PAUSAR PARTIDA
            // ----------------------------------------------------

            if (btnPausarPartida) {

                btnPausarPartida.addEventListener(
                    "click",
                    () => {
                        this.pausarPartida();
                    }
                );

            }


            // ----------------------------------------------------
            // FINALIZAR PARTIDA
            // ----------------------------------------------------

            if (btnFinalizarPartida) {

                btnFinalizarPartida.addEventListener(
                    "click",
                    () => {
                        this.finalizarPartidaManual();
                    }
                );

            }


            // ----------------------------------------------------
            // CONFIRMAR RESULTADO
            // ----------------------------------------------------

            if (btnConfirmarResultado) {

                btnConfirmarResultado.addEventListener(
                    "click",
                    () => {
                        this.confirmarResultado();
                    }
                );

            }


            // ----------------------------------------------------
            // BOTÕES + E -
            // ----------------------------------------------------

            const areaResultado =
                document.getElementById("areaResultado");

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


        // ========================================================
        // CARREGAR TIMES DO SORTEIO
        // ========================================================

        carregarTimesDoSorteio() {

            try {

                const dados =
                    localStorage.getItem(
                        "peladaDaFeTimes"
                    );

                if (!dados) {

                    console.warn(
                        "⚠️ Nenhum sorteio encontrado."
                    );

                    this.filaTimes = [];

                    return;
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
                        "⚠️ Dados do sorteio inválidos."
                    );

                    this.filaTimes = [];

                    return;
                }

                this.times.amarelo.jogadores =
                    Array.isArray(times.amarelo)
                        ? [...times.amarelo]
                        : (
                            Array.isArray(
                                times.amarelo.jogadores
                            )
                                ? [...times.amarelo.jogadores]
                                : []
                        );

                this.times.vermelho.jogadores =
                    Array.isArray(times.vermelho)
                        ? [...times.vermelho]
                        : (
                            Array.isArray(
                                times.vermelho.jogadores
                            )
                                ? [...times.vermelho.jogadores]
                                : []
                        );

                this.times.azul.jogadores =
                    Array.isArray(times.azul)
                        ? [...times.azul]
                        : (
                            Array.isArray(
                                times.azul.jogadores
                            )
                                ? [...times.azul.jogadores]
                                : []
                        );

                console.log(
                    "✅ Times carregados:",
                    this.times
                );

            } catch (erro) {

                console.warn(
                    "Não foi possível carregar os times do sorteio.",
                    erro
                );

            }

            this.filaTimes = [
                "amarelo",
                "vermelho",
                "azul"
            ];

        }


        // ========================================================
        // INICIAR PELADA
        // ========================================================

        iniciarPelada() {

            if (this.peladaIniciada) {
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

            this.duracaoPelada =
                duracaoPelada;

            this.duracaoPartida =
                duracaoPartida;

            this.tempoRestantePelada =
                duracaoPelada;

            this.tempoRestantePartida =
                duracaoPartida;

            this.peladaIniciada =
                true;

            this.peladaFinalizada =
                false;

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.resultadoPendente =
                false;

            this.salvandoResultado =
                false;

            this.partidasRealizadas =
                0;

            this.historico =
                [];

            this.limparGolsPartida();

            this.iniciadaEm = null;

            // ----------------------------------------------------
            // FILA INICIAL
            // ----------------------------------------------------

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
                "Pelada iniciada"
            );

            this.atualizarBadgePartida(
                "Aguardando início",
                "bg-secondary"
            );

            this.iniciarCronometroPelada();

            this.atualizarTela();

            this.atualizarBotoes();

            console.log(
                "🏆 Pelada iniciada."
            );

        }


        // ========================================================
        // CRONÔMETRO DA PELADA
        // ========================================================

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

                        if (
                            this.tempoRestantePelada <= 0
                        ) {

                            this.tempoRestantePelada =
                                0;

                            this.atualizarCronometroPelada();

                            this.finalizarPelada(
                                "Tempo da pelada encerrado."
                            );

                            return;
                        }

                        this.atualizarCronometroPelada();

                    },
                    1000
                );

        }


        // ========================================================
        // PARAR CRONÔMETRO DA PELADA
        // ========================================================

        pararCronometroPelada() {

            if (this.intervaloPelada) {

                clearInterval(
                    this.intervaloPelada
                );

                this.intervaloPelada =
                    null;
            }

        }


        // ========================================================
        // INICIAR PARTIDA
        // ========================================================

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

            if (
                !this.time1 ||
                !this.time2
            ) {

                this.mostrarErro(
                    "Não existem dois times disponíveis para iniciar a partida."
                );

                return;
            }

            if (
                this.tempoRestantePelada <= 0
            ) {

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

            this.partidaIniciada =
                true;

            this.partidaPausada =
                false;

            this.resultadoPendente =
                false;

            this.salvandoResultado =
                false;

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

            console.log(
                "⚽ Partida iniciada:",
                this.obterNomeTime(this.time1),
                "x",
                this.obterNomeTime(this.time2)
            );

        }


        // ========================================================
        // CRONÔMETRO DA PARTIDA
        // ========================================================

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

                        if (
                            this.tempoRestantePartida <= 0
                        ) {

                            this.tempoRestantePartida =
                                0;

                            this.atualizarCronometroPartida();

                            this.pararCronometroPartida();

                            this.finalizarPartidaPorTempo();

                            return;
                        }

                        this.atualizarCronometroPartida();

                    },
                    1000
                );

        }


        // ========================================================
        // PARAR CRONÔMETRO DA PARTIDA
        // ========================================================

        pararCronometroPartida() {

            if (this.intervaloPartida) {

                clearInterval(
                    this.intervaloPartida
                );

                this.intervaloPartida =
                    null;
            }

        }


        // ========================================================
        // PAUSAR PARTIDA
        // ========================================================

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

        }


        // ========================================================
        // FINALIZAR PARTIDA MANUALMENTE
        // ========================================================

        finalizarPartidaManual() {

            if (!this.partidaIniciada) {
                return;
            }

            this.pararCronometroPartida();

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.resultadoPendente =
                true;

            this.renderizarAreaResultado();

            this.atualizarStatus(
                "Informe o resultado da partida"
            );

            this.atualizarBadgePartida(
                "Aguardando resultado",
                "bg-warning text-dark"
            );

            this.atualizarBotoes();

        }


        // ========================================================
        // FINALIZAR POR TEMPO
        // ========================================================

        finalizarPartidaPorTempo() {

            if (!this.partidaIniciada) {
                return;
            }

            this.pararCronometroPartida();

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.resultadoPendente =
                true;

            this.renderizarAreaResultado();

            this.atualizarStatus(
                "Tempo encerrado - informe o resultado"
            );

            this.atualizarBadgePartida(
                "Tempo encerrado",
                "bg-danger"
            );

            this.atualizarBotoes();

        }


        // ========================================================
        // GOLS
        // ========================================================

        limparGolsPartida() {

            this.golsPartida = {
                time1: {},
                time2: {}
            };

        }


        // ========================================================
        // ALTERAR GOL DO JOGADOR
        // ========================================================

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

            const novoValor =
                Math.max(
                    0,
                    atual + quantidade
                );

            this.golsPartida[time][jogadorId] =
                novoValor;

            this.renderizarAreaResultado();

        }


        // ========================================================
        // OBTER JOGADORES DO TIME
        // ========================================================

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


        // ========================================================
        // ID DO JOGADOR
        // ========================================================

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


        // ========================================================
        // VERIFICAR SE É OBJECTID DO MONGODB
        // ========================================================

        ehObjectIdMongo(
            valor
        ) {

            return /^[a-fA-F0-9]{24}$/.test(
                String(valor || "")
            );

        }


        // ========================================================
        // NOME DO JOGADOR
        // ========================================================

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


        // ========================================================
        // NOME DO TIME
        // ========================================================

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


        // ========================================================
        // CALCULAR GOLS
        // ========================================================

        calcularTotalGols(
            time
        ) {

            if (!this.golsPartida[time]) {
                return 0;
            }

            return Object.values(
                this.golsPartida[time]
            ).reduce(
                (
                    total,
                    gols
                ) => {

                    return (
                        total +
                        Number(gols || 0)
                    );

                },
                0
            );

        }


        // ========================================================
        // OBTER GOLS DOS JOGADORES
        // ========================================================

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

                        gols:
                            Number(gols)

                    })
                );

        }


        // ========================================================
        // GOLS DETALHADOS
        // ========================================================

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
                (
                    jogador,
                    indice
                ) => {

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

                            jogadorId:
                                id,

                            jogadorNome:
                                this.obterNomeJogador(
                                    jogador
                                ),

                            gols:
                                gols

                        });

                    }

                }
            );

            return resultado;

        }


        // ========================================================
        // CONFIRMAR RESULTADO
        // ========================================================

        async confirmarResultado() {

            if (!this.resultadoPendente) {
                return;
            }

            if (this.salvandoResultado) {
                return;
            }

            if (
                !this.time1 ||
                !this.time2
            ) {
                return;
            }

            const golsTime1 =
                this.calcularTotalGols("time1");

            const golsTime2 =
                this.calcularTotalGols("time2");


            // ----------------------------------------------------
            // NÃO PERMITIR EMPATE
            // ----------------------------------------------------

            if (
                golsTime1 === golsTime2
            ) {

                this.mostrarMensagemResultado(
                    "O resultado não pode ser empate. Informe gols até que exista um vencedor.",
                    "danger"
                );

                return;
            }


            // ----------------------------------------------------
            // GUARDAR OS TIMES ANTES DA ROTAÇÃO
            // ----------------------------------------------------

            const time1Jogado =
                this.time1;

            const time2Jogado =
                this.time2;

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


            // ----------------------------------------------------
            // DURAÇÃO REAL DA PARTIDA
            // ----------------------------------------------------

            const duracaoConfigurada =
                this.obterDuracaoPartida();

            const duracaoDecorrida =
                Math.max(
                    0,
                    duracaoConfigurada -
                    this.tempoRestantePartida
                );


            // ----------------------------------------------------
            // REGISTRO LOCAL
            // ----------------------------------------------------

            const registro = {

                numero:
                    this.partidasRealizadas + 1,

                time1:
                    time1Jogado,

                time2:
                    time2Jogado,

                golsTime1:
                    golsTime1,

                golsTime2:
                    golsTime2,

                gols: {

                    time1:
                        golsTime1Detalhados,

                    time2:
                        golsTime2Detalhados

                },

                vencedor:
                    vencedor,

                perdedor:
                    perdedor,

                proximo:
                    proximoTimeAntesDaRotacao,

                duracao:
                    duracaoDecorrida,

                data:
                    new Date().toISOString()

            };


            // ----------------------------------------------------
            // SALVAR NO MONGODB
            // ----------------------------------------------------

            this.salvandoResultado =
                true;

            this.atualizarBotoes();

            this.atualizarStatus(
                "Salvando resultado..."
            );

            this.atualizarBadgePartida(
                "Salvando...",
                "bg-info text-dark"
            );

            try {

                const partidaSalva =
                    await this.salvarPartidaNoBanco(
                        registro
                    );

                console.log(
                    "✅ Partida salva no MongoDB:",
                    partidaSalva
                );

            } catch (erro) {

                console.error(
                    "❌ Erro ao salvar partida:",
                    erro
                );

                this.salvandoResultado =
                    false;

                this.atualizarStatus(
                    "Erro ao salvar resultado"
                );

                this.atualizarBadgePartida(
                    "Erro ao salvar",
                    "bg-danger"
                );

                this.mostrarErro(
                    erro.message ||
                    "Não foi possível salvar a partida no banco de dados."
                );

                this.atualizarBotoes();

                return;
            }


            // ----------------------------------------------------
            // SALVAMENTO LOCAL DO HISTÓRICO
            // ----------------------------------------------------

            this.partidasRealizadas++;

            registro.numero =
                this.partidasRealizadas;

            this.historico.push(
                registro
            );


            // ----------------------------------------------------
            // REGRA:
            //
            // VENCEDOR PERMANECE
            // PRÓXIMO ENTRA
            // PERDEDOR VAI PARA O FIM
            // ----------------------------------------------------

            const timeVencedor =
                vencedor;

            const timePerdedor =
                perdedor;

            const proximo =
                proximoTimeAntesDaRotacao;


            // ----------------------------------------------------
            // ROTAÇÃO
            // ----------------------------------------------------

            this.time1 =
                timeVencedor;

            this.time2 =
                proximo;

            if (timePerdedor) {

                this.filaTimes.push(
                    timePerdedor
                );

            }

            this.proximoTime =
                this.filaTimes.shift();


            // ----------------------------------------------------
            // LIMPAR ESTADO DA PARTIDA
            // ----------------------------------------------------

            this.resultadoPendente =
                false;

            this.salvandoResultado =
                false;

            this.iniciadaEm =
                null;

            this.limparGolsPartida();

            this.ocultarAreaResultado();


            // ----------------------------------------------------
            // ATUALIZAR TELA
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // MENSAGEM
            // ----------------------------------------------------

            const nomeTime1Jogado =
                this.obterNomeTime(
                    time1Jogado
                );

            const nomeTime2Jogado =
                this.obterNomeTime(
                    time2Jogado
                );

            const nomeVencedor =
                this.obterNomeTime(
                    vencedor
                );

            this.mostrarMensagemResultado(
                `Vitória do ${nomeVencedor} por ${golsTime1} x ${golsTime2}.`,
                "success"
            );


            // ----------------------------------------------------
            // LOG CORRETO
            // ----------------------------------------------------

            console.log(
                "🏆 Resultado:",
                nomeTime1Jogado,
                golsTime1,
                "x",
                golsTime2,
                nomeTime2Jogado,
                "| Vencedor:",
                nomeVencedor
            );

        }


        // ========================================================
        // SALVAR PARTIDA NO MONGODB
        // ========================================================

        async salvarPartidaNoBanco(
            registro
        ) {

            const jogadoresTimeA =
                this.obterJogadoresDoTime(
                    registro.time1
                );

            const jogadoresTimeB =
                this.obterJogadoresDoTime(
                    registro.time2
                );


            // ----------------------------------------------------
            // PEGAR SOMENTE IDs VÁLIDOS DO MONGODB
            // ----------------------------------------------------

            const idsTimeA =
                jogadoresTimeA
                    .map(
                        (
                            jogador,
                            indice
                        ) =>
                            this.obterIdJogador(
                                jogador,
                                indice
                            )
                    )
                    .filter(
                        id =>
                            this.ehObjectIdMongo(id)
                    );


            const idsTimeB =
                jogadoresTimeB
                    .map(
                        (
                            jogador,
                            indice
                        ) =>
                            this.obterIdJogador(
                                jogador,
                                indice
                            )
                    )
                    .filter(
                        id =>
                            this.ehObjectIdMongo(id)
                    );


            // ----------------------------------------------------
            // MONTAR PAYLOAD
            // ----------------------------------------------------

            const payload = {

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
                    Number(
                        registro.golsTime1 || 0
                    ),

                golsTimeB:
                    Number(
                        registro.golsTime2 || 0
                    ),

                vencedor:
                    registro.golsTime1 >
                    registro.golsTime2
                        ? "timeA"
                        : "timeB",

                numero:
                    Number(
                        registro.numero
                    ),

                duracaoSegundos:
                    Number(
                        registro.duracao || 0
                    ),

                iniciadaEm:
                    registro.iniciadaEm ||
                    this.iniciadaEm ||
                    null,

                finalizadaEm:
                    registro.data ||
                    new Date().toISOString(),

                finalizada:
                    true

            };


            console.log(
                "📤 Enviando partida para /api/partidas:",
                payload
            );


            // ----------------------------------------------------
            // REQUISIÇÃO
            // ----------------------------------------------------

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
                            JSON.stringify(
                                payload
                            )
                    }
                );


            // ----------------------------------------------------
            // TENTAR LER RESPOSTA
            // ----------------------------------------------------

            let dados = null;

            try {

                dados =
                    await resposta.json();

            } catch (erro) {

                dados = null;

            }


            // ----------------------------------------------------
            // ERRO HTTP
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // RETORNAR PARTIDA SALVA
            // ----------------------------------------------------

            return (
                dados?.partida ||
                dados
            );

        }


        // ========================================================
        // RENDERIZAR ÁREA DE RESULTADO
        // ========================================================

        renderizarAreaResultado() {

            const area =
                document.getElementById(
                    "areaResultado"
                );

            if (!area) {
                return;
            }

            area.classList.remove(
                "d-none"
            );

            const nomeTime1 =
                this.obterNomeTime(
                    this.time1
                );

            const nomeTime2 =
                this.obterNomeTime(
                    this.time2
                );

            const golsTime1 =
                this.calcularTotalGols(
                    "time1"
                );

            const golsTime2 =
                this.calcularTotalGols(
                    "time2"
                );

            const placarNomeTime1 =
                document.getElementById(
                    "placarNomeTime1"
                );

            const placarNomeTime2 =
                document.getElementById(
                    "placarNomeTime2"
                );

            const tituloGolsTime1 =
                document.getElementById(
                    "tituloGolsTime1"
                );

            const tituloGolsTime2 =
                document.getElementById(
                    "tituloGolsTime2"
                );

            const placarTime1 =
                document.getElementById(
                    "placarTime1"
                );

            const placarTime2 =
                document.getElementById(
                    "placarTime2"
                );


            if (placarNomeTime1) {
                placarNomeTime1.textContent =
                    nomeTime1;
            }

            if (placarNomeTime2) {
                placarNomeTime2.textContent =
                    nomeTime2;
            }

            if (tituloGolsTime1) {
                tituloGolsTime1.textContent =
                    nomeTime1;
            }

            if (tituloGolsTime2) {
                tituloGolsTime2.textContent =
                    nomeTime2;
            }

            if (placarTime1) {
                placarTime1.textContent =
                    golsTime1;
            }

            if (placarTime2) {
                placarTime2.textContent =
                    golsTime2;
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

                mensagem.classList.remove(
                    "d-none"
                );

                if (
                    golsTime1 === golsTime2
                ) {

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


        // ========================================================
        // RENDERIZAR LISTA DE GOLS
        // ========================================================

        renderizarListaGols(
            time,
            elementoId
        ) {

            const elemento =
                document.getElementById(
                    elementoId
                );

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
                        (
                            jogador,
                            indice
                        ) => {

                            const id =
                                this.obterIdJogador(
                                    jogador,
                                    indice
                                );

                            const nome =
                                this.obterNomeJogador(
                                    jogador
                                );

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


        // ========================================================
        // OCULTAR ÁREA DE RESULTADO
        // ========================================================

        ocultarAreaResultado() {

            const area =
                document.getElementById(
                    "areaResultado"
                );

            if (area) {

                area.classList.add(
                    "d-none"
                );

            }

        }


        // ========================================================
        // MENSAGEM DO RESULTADO
        // ========================================================

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

            elemento.classList.remove(
                "d-none"
            );

            elemento.innerHTML =
                mensagem;

        }


        // ========================================================
        // ESTIMATIVA DE PARTIDAS
        // ========================================================

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

                elemento.textContent =
                    "—";

                return;
            }

            const estimativa =
                Math.floor(
                    total / partida
                );

            elemento.textContent =
                estimativa;

        }


        // ========================================================
        // DURAÇÃO DA PELADA
        // ========================================================

        obterDuracaoPelada() {

            const elemento =
                document.getElementById(
                    "duracaoPelada"
                );

            const minutos =
                Number(
                    elemento?.value || 60
                );

            if (
                !Number.isFinite(minutos) ||
                minutos <= 0
            ) {

                return 0;
            }

            return Math.round(
                minutos * 60
            );

        }


        // ========================================================
        // DURAÇÃO DA PARTIDA
        // ========================================================

        obterDuracaoPartida() {

            const elemento =
                document.getElementById(
                    "duracaoPartida"
                );

            const minutos =
                Number(
                    elemento?.value || 7
                );

            if (
                !Number.isFinite(minutos) ||
                minutos <= 0
            ) {

                return 0;
            }

            return Math.round(
                minutos * 60
            );

        }


        // ========================================================
        // CRONÔMETRO PELADA
        // ========================================================

        atualizarCronometroPelada() {

            const elementos = [

                document.getElementById(
                    "tempoRestantePelada"
                )

            ];

            elementos.forEach(
                elemento => {

                    if (elemento) {

                        elemento.textContent =
                            this.formatarTempo(
                                this.tempoRestantePelada
                            );

                    }

                }
            );

        }


        // ========================================================
        // CRONÔMETRO PARTIDA
        // ========================================================

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


        // ========================================================
        // FORMATAR TEMPO
        // ========================================================

        formatarTempo(
            segundos
        ) {

            segundos =
                Math.max(
                    0,
                    Math.floor(
                        segundos
                    )
                );

            const horas =
                Math.floor(
                    segundos / 3600
                );

            const minutos =
                Math.floor(
                    (
                        segundos % 3600
                    ) / 60
                );

            const segundosRestantes =
                segundos % 60;

            if (horas > 0) {

                return (
                    String(horas)
                        .padStart(2, "0") +
                    ":" +
                    String(minutos)
                        .padStart(2, "0") +
                    ":" +
                    String(segundosRestantes)
                        .padStart(2, "0")
                );

            }

            return (
                String(minutos)
                    .padStart(2, "0") +
                ":" +
                String(segundosRestantes)
                    .padStart(2, "0")
            );

        }


        // ========================================================
        // ATUALIZAR STATUS
        // ========================================================

        atualizarStatus(
            texto
        ) {

            const elemento =
                document.getElementById(
                    "statusPartida"
                );

            if (elemento) {

                elemento.textContent =
                    texto;

            }

        }


        // ========================================================
        // ATUALIZAR BADGE
        // ========================================================

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

            elemento.textContent =
                texto;

            elemento.className =
                `badge px-3 py-2 ${classe}`;

        }


        // ========================================================
        // ATUALIZAR TELA
        // ========================================================

        atualizarTela() {

            // ----------------------------------------------------
            // PRÓXIMO TIME
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // NOME TIME 1
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // NOME TIME 2
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // JOGADORES TIME 1
            // ----------------------------------------------------

            this.renderizarJogadoresTela(
                this.time1,
                "jogadoresTimePartida1"
            );


            // ----------------------------------------------------
            // JOGADORES TIME 2
            // ----------------------------------------------------

            this.renderizarJogadoresTela(
                this.time2,
                "jogadoresTimePartida2"
            );


            // ----------------------------------------------------
            // NÚMERO DA PARTIDA
            // ----------------------------------------------------

            const numeroPartida =
                document.getElementById(
                    "numeroPartida"
                );

            if (numeroPartida) {

                numeroPartida.textContent =
                    this.partidasRealizadas + 1;

            }


            // ----------------------------------------------------
            // PARTIDAS REALIZADAS
            // ----------------------------------------------------

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


        // ========================================================
        // RENDERIZAR JOGADORES DA PARTIDA
        // ========================================================

        renderizarJogadoresTela(
            codigoTime,
            elementoId
        ) {

            const elemento =
                document.getElementById(
                    elementoId
                );

            if (!elemento) {
                return;
            }

            const jogadores =
                this.obterJogadoresDoTime(
                    codigoTime
                );

            if (!jogadores.length) {

                elemento.innerHTML = `
                    <div class="text-muted">
                        Nenhum jogador cadastrado.
                    </div>
                `;

                return;
            }

            elemento.innerHTML =
                `
                    <div class="d-flex flex-column gap-1">

                        ${
                            jogadores
                                .map(
                                    jogador => {

                                        return `
                                            <div>
                                                <i class="bi bi-person me-1"></i>
                                                ${this.escaparHtml(
                                                    this.obterNomeJogador(
                                                        jogador
                                                    )
                                                )}
                                            </div>
                                        `;

                                    }
                                )
                                .join("")
                        }

                    </div>
                `;

        }


        // ========================================================
        // RENDERIZAR HISTÓRICO
        // ========================================================

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
                this.historico
                    .map(
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
                                        <strong>
                                            ${partida.numero}
                                        </strong>
                                    </td>

                                    <td>
                                        ${this.escaparHtml(nomeTime1)}
                                    </td>

                                    <td class="text-center">

                                        <span
                                            class="badge bg-dark fs-6"
                                        >
                                            ${placar}
                                        </span>

                                    </td>

                                    <td>
                                        ${this.escaparHtml(nomeTime2)}
                                    </td>

                                    <td>

                                        <span
                                            class="badge bg-success"
                                        >

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
                    )
                    .join("");

        }


        // ========================================================
        // FORMATAR DATA
        // ========================================================

        formatarData(
            data
        ) {

            if (!data) {
                return "—";
            }

            try {

                return new Date(
                    data
                ).toLocaleString(
                    "pt-BR"
                );

            } catch (erro) {

                return "—";

            }

        }


        // ========================================================
        // REINICIAR PELADA
        // ========================================================

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

            this.peladaIniciada =
                false;

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.peladaFinalizada =
                false;

            this.resultadoPendente =
                false;

            this.salvandoResultado =
                false;

            this.partidasRealizadas =
                0;

            this.historico =
                [];

            this.tempoRestantePelada =
                this.obterDuracaoPelada();

            this.tempoRestantePartida =
                this.obterDuracaoPartida();

            this.limparGolsPartida();

            // Recarrega os times atuais do sorteio
            this.carregarTimesDoSorteio();

            this.filaTimes = [
                "amarelo",
                "vermelho",
                "azul"
            ];

            this.time1 =
                null;

            this.time2 =
                null;

            this.proximoTime =
                null;

            this.iniciadaEm =
                null;

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

            console.log(
                "🔄 Pelada reiniciada."
            );

        }


        // ========================================================
        // FINALIZAR PELADA
        // ========================================================

        finalizarPelada(
            mensagem
        ) {

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            this.peladaFinalizada =
                true;

            this.peladaIniciada =
                false;

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.resultadoPendente =
                false;

            this.salvandoResultado =
                false;

            this.atualizarStatus(
                mensagem ||
                "Pelada finalizada"
            );

            this.atualizarBadgePartida(
                "Pelada finalizada",
                "bg-danger"
            );

            this.atualizarCronometroPelada();

            this.atualizarBotoes();

            console.log(
                "🏁 Pelada finalizada."
            );

        }


        // ========================================================
        // ATUALIZAR BOTÕES
        // ========================================================

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

                btnReiniciarPelada.disabled =
                    false;

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


        // ========================================================
        // ESCAPAR HTML
        // ========================================================

        escaparHtml(
            valor
        ) {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent =
                valor ?? "";

            return div.innerHTML;

        }


        // ========================================================
        // ERRO
        // ========================================================

        mostrarErro(
            mensagem
        ) {

            console.error(
                mensagem
            );

            if (
                typeof toast === "function"
            ) {

                toast(
                    mensagem,
                    "#dc3545"
                );

                return;
            }

            if (
                typeof Swal !== "undefined"
            ) {

                Swal.fire({

                    icon: "error",

                    title: "Atenção",

                    text: mensagem

                });

                return;
            }

            alert(
                mensagem
            );

        }


        // ========================================================
        // DESTROY
        // ========================================================

        destroy() {

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            console.log(
                "🧹 Módulo Partidas destruído."
            );

        }

    }


    // ============================================================
    // INICIAR
    // ============================================================

    window.Partidas =
        new Partidas();

})();