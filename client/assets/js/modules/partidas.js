(function () {

    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: CONTROLE DE PARTIDAS
    // ============================================================

    class Partidas {

        constructor() {

            // ====================================================
            // CONFIGURAÇÕES
            // ====================================================

            this.duracaoPelada =
                60 * 60;

            this.duracaoPartida =
                7 * 60;

            // ====================================================
            // ESTADO
            // ====================================================

            this.peladaIniciada =
                false;

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.peladaFinalizada =
                false;

            // ====================================================
            // CRONÔMETROS
            // ====================================================

            this.intervaloPelada =
                null;

            this.intervaloPartida =
                null;

            this.tempoRestantePelada =
                this.duracaoPelada;

            this.tempoRestantePartida =
                this.duracaoPartida;

            // ====================================================
            // HISTÓRICO
            // ====================================================

            this.partidasRealizadas =
                0;

            this.historico =
                [];

            // ====================================================
            // TIMES
            // ====================================================

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

            // ====================================================
            // FILA
            // ====================================================

            this.filaTimes =
                [];

            this.time1 =
                null;

            this.time2 =
                null;

            this.proximoTime =
                null;

            // ====================================================
            // INICIALIZAR
            // ====================================================

            this.inicializar();

        }

        // ========================================================
        // INICIALIZAR
        // ========================================================

        inicializar() {

            console.log(
                "⚽ Módulo Partidas iniciado."
            );

            this.configurarEventos();

            this.carregarTimesDoSorteio();

            this.atualizarTela();

            this.atualizarEstimativa();

            this.atualizarStatus(
                "Pelada não iniciada"
            );

            this.atualizarBadgePartida(
                "Aguardando",
                "bg-secondary"
            );

        }

        // ========================================================
        // EVENTOS
        // ========================================================

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

            const btnVitoriaTime1 =
                document.getElementById(
                    "btnVitoriaTime1"
                );

            const btnVitoriaTime2 =
                document.getElementById(
                    "btnVitoriaTime2"
                );

            const btnEmpate =
                document.getElementById(
                    "btnEmpate"
                );

            const duracaoPelada =
                document.getElementById(
                    "duracaoPelada"
                );

            const duracaoPartida =
                document.getElementById(
                    "duracaoPartida"
                );

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
            // PAUSAR
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
            // FINALIZAR
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
            // VITÓRIA TIME 1
            // ----------------------------------------------------

            if (btnVitoriaTime1) {

                btnVitoriaTime1.addEventListener(
                    "click",
                    () => {

                        this.registrarResultado(
                            "time1"
                        );

                    }
                );

            }

            // ----------------------------------------------------
            // VITÓRIA TIME 2
            // ----------------------------------------------------

            if (btnVitoriaTime2) {

                btnVitoriaTime2.addEventListener(
                    "click",
                    () => {

                        this.registrarResultado(
                            "time2"
                        );

                    }
                );

            }

            // ----------------------------------------------------
            // EMPATE
            // ----------------------------------------------------

            if (btnEmpate) {

                btnEmpate.addEventListener(
                    "click",
                    () => {

                        this.registrarResultado(
                            "empate"
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

                    this.filaTimes =
                        [];

                    return;

                }

                const times =
                    JSON.parse(dados);

                if (
                    !times ||
                    !Array.isArray(times.amarelo) ||
                    !Array.isArray(times.vermelho) ||
                    !Array.isArray(times.azul)
                ) {

                    console.warn(
                        "⚠️ Dados do sorteio inválidos."
                    );

                    this.filaTimes =
                        [];

                    return;

                }

                this.times.amarelo.jogadores =
                    [...times.amarelo];

                this.times.vermelho.jogadores =
                    [...times.vermelho];

                this.times.azul.jogadores =
                    [...times.azul];

                this.filaTimes = [
                    "amarelo",
                    "vermelho",
                    "azul"
                ];

                console.log(
                    "⚽ Times carregados:",
                    this.times
                );

            } catch (erro) {

                console.error(
                    "❌ Erro ao carregar times:",
                    erro
                );

                this.filaTimes =
                    [];

            }

        }

        // ========================================================
        // INICIAR PELADA
        // ========================================================

        iniciarPelada() {

            if (this.peladaIniciada) {
                return;
            }

            // ----------------------------------------------------
            // VERIFICAR TIMES
            // ----------------------------------------------------

            const existemTresTimes =
                this.times.amarelo.jogadores.length > 0 &&
                this.times.vermelho.jogadores.length > 0 &&
                this.times.azul.jogadores.length > 0;

            if (!existemTresTimes) {

                this.mostrarErro(
                    "É necessário realizar o sorteio dos times antes de iniciar a pelada."
                );

                return;

            }

            // ----------------------------------------------------
            // DURAÇÕES
            // ----------------------------------------------------

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

            this.duracaoPelada =
                duracaoPelada;

            this.duracaoPartida =
                duracaoPartida;

            this.tempoRestantePelada =
                duracaoPelada;

            this.tempoRestantePartida =
                duracaoPartida;

            // ----------------------------------------------------
            // ESTADO
            // ----------------------------------------------------

            this.peladaIniciada =
                true;

            this.peladaFinalizada =
                false;

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.partidasRealizadas =
                0;

            this.historico =
                [];

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
                "Aguardando partida",
                "bg-secondary"
            );

            this.iniciarCronometroPelada();

            this.atualizarTela();

            this.atualizarBotoes();

            console.log(
                "🏆 Pelada iniciada:",
                this.time1,
                "x",
                this.time2
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

                        this.atualizarCronometroPelada();

                        if (
                            this.tempoRestantePelada <= 0
                        ) {

                            this.tempoRestantePelada =
                                0;

                            this.finalizarPelada(
                                "Tempo da pelada encerrado."
                            );

                        }

                    },
                    1000
                );

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
                return;
            }

            if (this.partidaIniciada) {
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

            this.tempoRestantePartida =
                Math.min(
                    this.obterDuracaoPartida(),
                    this.tempoRestantePelada
                );

            this.partidaIniciada =
                true;

            this.partidaPausada =
                false;

            this.esconderAreaResultado();

            this.atualizarStatus(
                "Partida em andamento"
            );

            this.atualizarBadgePartida(
                "Em andamento",
                "bg-success"
            );

            this.iniciarCronometroPartida();

            this.atualizarCronometroPartida();

            this.atualizarBotoes();

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

                        this.atualizarCronometroPartida();

                        if (
                            this.tempoRestantePartida <= 0
                        ) {

                            this.tempoRestantePartida =
                                0;

                            this.pararCronometroPartida();

                            this.finalizarPartidaPorTempo();

                        }

                    },
                    1000
                );

        }

        // ========================================================
        // PAUSAR / CONTINUAR
        // ========================================================

        pausarPartida() {

            if (!this.partidaIniciada) {
                return;
            }

            this.partidaPausada =
                !this.partidaPausada;

            const botao =
                document.getElementById(
                    "btnPausarPartida"
                );

            if (this.partidaPausada) {

                this.atualizarStatus(
                    "Partida pausada"
                );

                this.atualizarBadgePartida(
                    "Pausada",
                    "bg-warning text-dark"
                );

                if (botao) {

                    botao.innerHTML = `
                        <i class="bi bi-play-fill me-1"></i>
                        Continuar
                    `;

                }

            } else {

                this.atualizarStatus(
                    "Partida em andamento"
                );

                this.atualizarBadgePartida(
                    "Em andamento",
                    "bg-success"
                );

                if (botao) {

                    botao.innerHTML = `
                        <i class="bi bi-pause-fill me-1"></i>
                        Pausar
                    `;

                }

            }

        }

        // ========================================================
        // FINALIZAR PARTIDA MANUAL
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

            this.mostrarAreaResultado();

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

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.mostrarAreaResultado();

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
        // REGISTRAR RESULTADO
        // ========================================================

        registrarResultado(resultado) {

            if (
                !this.time1 ||
                !this.time2
            ) {
                return;
            }

            const time1 =
                this.time1;

            const time2 =
                this.time2;

            const proximo =
                this.proximoTime;

            let vencedor =
                null;

            if (resultado === "time1") {
                vencedor = time1;
            }

            if (resultado === "time2") {
                vencedor = time2;
            }

            // ----------------------------------------------------
            // SALVAR HISTÓRICO
            // ----------------------------------------------------

            this.partidasRealizadas++;

            this.historico.push({

                numero:
                    this.partidasRealizadas,

                time1:
                    time1,

                time2:
                    time2,

                resultado:
                    resultado,

                vencedor:
                    vencedor,

                proximo:
                    proximo,

                duracao:
                    this.obterDuracaoPartida() -
                    this.tempoRestantePartida,

                data:
                    new Date().toISOString()

            });

            // ----------------------------------------------------
            // REGRA:
            //
            // VENCEDOR CONTINUA
            // PRÓXIMO TIME ENTRA
            // PERDEDOR VAI PARA A FILA
            // ----------------------------------------------------

            if (
                resultado === "time1" ||
                resultado === "time2"
            ) {

                const perdedor =
                    vencedor === time1
                        ? time2
                        : time1;

                if (proximo) {

                    /*
                     * O vencedor continua.
                     * O próximo entra.
                     * O perdedor vai para o fim da fila.
                     */

                    this.time1 =
                        vencedor;

                    this.time2 =
                        proximo;

                    this.filaTimes.push(
                        perdedor
                    );

                    this.proximoTime =
                        this.filaTimes.shift() ||
                        null;

                } else {

                    /*
                     * Segurança caso a fila esteja vazia.
                     */

                    this.time1 =
                        vencedor;

                    this.time2 =
                        perdedor;

                    this.proximoTime =
                        null;

                }

            } else {

                // ------------------------------------------------
                // EMPATE
                //
                // Os dois times saem.
                // O próximo time entra.
                //
                // Recolocamos os dois anteriores no final
                // da fila para manter o rodízio.
                // ------------------------------------------------

                this.filaTimes.push(
                    time1
                );

                this.filaTimes.push(
                    time2
                );

                /*
                 * Se havia um terceiro time,
                 * ele entra primeiro.
                 */

                if (proximo) {

                    this.time1 =
                        proximo;

                    this.time2 =
                        this.filaTimes.shift() ||
                        null;

                    this.proximoTime =
                        this.filaTimes.shift() ||
                        null;

                } else {

                    this.time1 =
                        this.filaTimes.shift() ||
                        null;

                    this.time2 =
                        this.filaTimes.shift() ||
                        null;

                    this.proximoTime =
                        this.filaTimes.shift() ||
                        null;

                }

            }

            // ----------------------------------------------------
            // PRÓXIMA PARTIDA
            // ----------------------------------------------------

            this.tempoRestantePartida =
                Math.min(
                    this.obterDuracaoPartida(),
                    this.tempoRestantePelada
                );

            this.esconderAreaResultado();

            this.atualizarStatus(
                "Resultado registrado"
            );

            this.atualizarBadgePartida(
                "Próxima partida",
                "bg-primary"
            );

            this.atualizarTela();

            this.atualizarBotoes();

            console.log(
                "🏆 Resultado:",
                resultado
            );

            console.log(
                "➡️ Próxima:",
                this.time1,
                "x",
                this.time2
            );

        }

        // ========================================================
        // FINALIZAR PELADA
        // ========================================================

        finalizarPelada(mensagem) {

            this.peladaFinalizada =
                true;

            this.peladaIniciada =
                false;

            this.partidaIniciada =
                false;

            this.partidaPausada =
                false;

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            this.atualizarStatus(
                mensagem ||
                "Pelada encerrada"
            );

            this.atualizarBadgePartida(
                "Encerrada",
                "bg-danger"
            );

            this.atualizarBotoes();

            alert(
                mensagem ||
                "A pelada foi encerrada."
            );

        }

        // ========================================================
        // REINICIAR PELADA
        // ========================================================

        reiniciarPelada() {

            const confirmar =
                window.confirm(
                    "Deseja realmente reiniciar a pelada? O histórico atual será perdido."
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

            this.partidasRealizadas =
                0;

            this.historico =
                [];

            this.tempoRestantePelada =
                this.obterDuracaoPelada();

            this.tempoRestantePartida =
                this.obterDuracaoPartida();

            this.filaTimes =
                [];

            this.time1 =
                null;

            this.time2 =
                null;

            this.proximoTime =
                null;

            this.carregarTimesDoSorteio();

            this.esconderAreaResultado();

            this.atualizarStatus(
                "Pelada não iniciada"
            );

            this.atualizarBadgePartida(
                "Aguardando",
                "bg-secondary"
            );

            this.atualizarTela();

            this.atualizarBotoes();

        }

        // ========================================================
        // PARAR CRONÔMETRO PELADA
        // ========================================================

        pararCronometroPelada() {

            if (
                this.intervaloPelada !== null
            ) {

                clearInterval(
                    this.intervaloPelada
                );

                this.intervaloPelada =
                    null;

            }

        }

        // ========================================================
        // PARAR CRONÔMETRO PARTIDA
        // ========================================================

        pararCronometroPartida() {

            if (
                this.intervaloPartida !== null
            ) {

                clearInterval(
                    this.intervaloPartida
                );

                this.intervaloPartida =
                    null;

            }

        }

        // ========================================================
        // ATUALIZAR TELA
        // ========================================================

        atualizarTela() {

            this.atualizarCronometroPelada();

            this.atualizarCronometroPartida();

            this.atualizarNumeroPartida();

            this.atualizarTimesTela();

            this.atualizarHistorico();

            this.atualizarBotoes();

        }

        // ========================================================
        // CRONÔMETRO PELADA
        // ========================================================

        atualizarCronometroPelada() {

            const elemento =
                document.getElementById(
                    "tempoRestantePelada"
                );

            if (!elemento) {
                return;
            }

            elemento.textContent =
                this.formatarTempo(
                    this.tempoRestantePelada
                );

        }

        // ========================================================
        // CRONÔMETRO PARTIDA
        // ========================================================

        atualizarCronometroPartida() {

            const elemento =
                document.getElementById(
                    "tempoRestantePartida"
                );

            const cronometro =
                document.getElementById(
                    "cronometroPartida"
                );

            const tempo =
                this.formatarTempo(
                    this.tempoRestantePartida
                );

            if (elemento) {

                elemento.textContent =
                    tempo;

            }

            if (cronometro) {

                cronometro.textContent =
                    tempo;

            }

        }

        // ========================================================
        // ATUALIZAR TIMES NA TELA
        // ========================================================

        atualizarTimesTela() {

            const nome1 =
                document.getElementById(
                    "nomeTimePartida1"
                );

            const nome2 =
                document.getElementById(
                    "nomeTimePartida2"
                );

            const jogadores1 =
                document.getElementById(
                    "jogadoresTimePartida1"
                );

            const jogadores2 =
                document.getElementById(
                    "jogadoresTimePartida2"
                );

            const proximo =
                document.getElementById(
                    "cardProximoTime"
                );

            const proximoTexto =
                document.getElementById(
                    "proximoTime"
                );

            const textoVitoria1 =
                document.getElementById(
                    "textoVitoriaTime1"
                );

            const textoVitoria2 =
                document.getElementById(
                    "textoVitoriaTime2"
                );

            // ----------------------------------------------------
            // TIME 1
            // ----------------------------------------------------

            if (this.time1) {

                const time =
                    this.times[
                        this.time1
                    ];

                if (nome1) {

                    nome1.textContent =
                        time.nome;

                }

                if (jogadores1) {

                    jogadores1.innerHTML =
                        this.renderizarJogadoresTime(
                            time.jogadores
                        );

                }

                if (textoVitoria1) {

                    textoVitoria1.textContent =
                        time.nome;

                }

            } else {

                if (nome1) {

                    nome1.textContent =
                        "Aguardando";

                }

                if (jogadores1) {

                    jogadores1.innerHTML =
                        "";

                }

            }

            // ----------------------------------------------------
            // TIME 2
            // ----------------------------------------------------

            if (this.time2) {

                const time =
                    this.times[
                        this.time2
                    ];

                if (nome2) {

                    nome2.textContent =
                        time.nome;

                }

                if (jogadores2) {

                    jogadores2.innerHTML =
                        this.renderizarJogadoresTime(
                            time.jogadores
                        );

                }

                if (textoVitoria2) {

                    textoVitoria2.textContent =
                        time.nome;

                }

            } else {

                if (nome2) {

                    nome2.textContent =
                        "Aguardando";

                }

                if (jogadores2) {

                    jogadores2.innerHTML =
                        "";

                }

            }

            // ----------------------------------------------------
            // PRÓXIMO TIME
            // ----------------------------------------------------

            const nomeProximo =
                this.proximoTime
                    ? this.times[
                        this.proximoTime
                    ].nome
                    : "Nenhum";

            if (proximo) {

                proximo.textContent =
                    nomeProximo;

            }

            if (proximoTexto) {

                proximoTexto.textContent =
                    nomeProximo;

            }

        }

        // ========================================================
        // RENDERIZAR JOGADORES
        // ========================================================

        renderizarJogadoresTime(jogadores) {

            if (
                !Array.isArray(jogadores) ||
                !jogadores.length
            ) {

                return `
                    <span class="text-muted">
                        Nenhum jogador
                    </span>
                `;

            }

            return jogadores
                .map(jogador => {

                    const nome =
                        this.escaparHtml(
                            jogador.nome ||
                            "Sem nome"
                        );

                    return `
                        <div class="mb-1">
                            <i class="bi bi-person-fill me-1"></i>
                            ${nome}
                        </div>
                    `;

                })
                .join("");

        }

        // ========================================================
        // HISTÓRICO
        // ========================================================

        atualizarHistorico() {

            const elemento =
                document.getElementById(
                    "historicoPartidas"
                );

            const badge =
                document.getElementById(
                    "badgeHistorico"
                );

            if (badge) {

                badge.textContent =
                    this.historico.length;

            }

            if (!elemento) {
                return;
            }

            if (!this.historico.length) {

                elemento.innerHTML = `
                    <div class="text-center text-muted py-5">

                        <i class="bi bi-clock-history fs-1 d-block mb-3"></i>

                        <p class="mb-0">
                            Nenhuma partida realizada ainda.
                        </p>

                    </div>
                `;

                return;

            }

            elemento.innerHTML = `
                <table class="table table-hover align-middle mb-0">

                    <thead class="table-light">

                        <tr>

                            <th>
                                Partida
                            </th>

                            <th>
                                Confronto
                            </th>

                            <th>
                                Resultado
                            </th>

                            <th>
                                Próximo
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${this.historico
                            .slice()
                            .reverse()
                            .map(partida =>
                                this.criarLinhaHistorico(
                                    partida
                                )
                            )
                            .join("")}

                    </tbody>

                </table>
            `;

        }

        // ========================================================
        // LINHA HISTÓRICO
        // ========================================================

        criarLinhaHistorico(partida) {

            const nome1 =
                this.times[
                    partida.time1
                ]?.nome ||
                partida.time1;

            const nome2 =
                this.times[
                    partida.time2
                ]?.nome ||
                partida.time2;

            let resultado;

            if (
                partida.resultado ===
                "empate"
            ) {

                resultado = `
                    <span class="badge bg-secondary">
                        Empate
                    </span>
                `;

            } else {

                const vencedor =
                    this.times[
                        partida.vencedor
                    ]?.nome ||
                    partida.vencedor;

                resultado = `
                    <span class="badge bg-success">
                        ${this.escaparHtml(
                            vencedor
                        )}
                    </span>
                `;

            }

            const proximo =
                partida.proximo
                    ? (
                        this.times[
                            partida.proximo
                        ]?.nome ||
                        partida.proximo
                    )
                    : "—";

            return `
                <tr>

                    <td>
                        <strong>
                            #${partida.numero}
                        </strong>
                    </td>

                    <td>

                        ${this.escaparHtml(
                            nome1
                        )}

                        <strong class="mx-1">
                            ×
                        </strong>

                        ${this.escaparHtml(
                            nome2
                        )}

                    </td>

                    <td>
                        ${resultado}
                    </td>

                    <td>

                        <span class="text-muted">
                            ${this.escaparHtml(
                                proximo
                            )}
                        </span>

                    </td>

                </tr>
            `;

        }

        // ========================================================
        // NÚMERO DA PARTIDA
        // ========================================================

        atualizarNumeroPartida() {

            const elemento =
                document.getElementById(
                    "numeroPartida"
                );

            if (!elemento) {
                return;
            }

            if (!this.peladaIniciada) {

                elemento.textContent =
                    "Nenhuma partida iniciada";

                return;

            }

            elemento.textContent =
                `Partida #${
                    this.partidasRealizadas + 1
                }`;

        }

        // ========================================================
        // ÁREA DE RESULTADO
        // ========================================================

        mostrarAreaResultado() {

            const elemento =
                document.getElementById(
                    "areaResultado"
                );

            if (elemento) {

                elemento.classList.remove(
                    "d-none"
                );

            }

        }

        // ========================================================
        // ESCONDER RESULTADO
        // ========================================================

        esconderAreaResultado() {

            const elemento =
                document.getElementById(
                    "areaResultado"
                );

            if (elemento) {

                elemento.classList.add(
                    "d-none"
                );

            }

        }

        // ========================================================
        // ATUALIZAR BOTÕES
        // ========================================================

        atualizarBotoes() {

            const iniciarPelada =
                document.getElementById(
                    "btnIniciarPelada"
                );

            const reiniciarPelada =
                document.getElementById(
                    "btnReiniciarPelada"
                );

            const iniciarPartida =
                document.getElementById(
                    "btnIniciarPartida"
                );

            const pausarPartida =
                document.getElementById(
                    "btnPausarPartida"
                );

            const finalizarPartida =
                document.getElementById(
                    "btnFinalizarPartida"
                );

            // ----------------------------------------------------
            // INICIAR PELADA
            // ----------------------------------------------------

            if (iniciarPelada) {

                iniciarPelada.disabled =
                    this.peladaIniciada ||
                    this.peladaFinalizada;

            }

            // ----------------------------------------------------
            // REINICIAR
            // ----------------------------------------------------

            if (reiniciarPelada) {

                reiniciarPelada.disabled =
                    !this.peladaIniciada &&
                    !this.historico.length;

            }

            // ----------------------------------------------------
            // INICIAR PARTIDA
            // ----------------------------------------------------

            if (iniciarPartida) {

                const existemDoisTimes =
                    !!this.time1 &&
                    !!this.time2;

                iniciarPartida.disabled =
                    !this.peladaIniciada ||
                    this.peladaFinalizada ||
                    this.partidaIniciada ||
                    !existemDoisTimes;

            }

            // ----------------------------------------------------
            // PAUSAR
            // ----------------------------------------------------

            if (pausarPartida) {

                pausarPartida.disabled =
                    !this.partidaIniciada;

            }

            // ----------------------------------------------------
            // FINALIZAR
            // ----------------------------------------------------

            if (finalizarPartida) {

                finalizarPartida.disabled =
                    !this.partidaIniciada;

            }

        }

        // ========================================================
        // BADGE
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

            elemento.className =
                `badge ${classe}`;

            elemento.textContent =
                texto;

        }

        // ========================================================
        // STATUS
        // ========================================================

        atualizarStatus(texto) {

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
        // ESTIMATIVA
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

            elemento.textContent =
                Math.floor(
                    total / partida
                );

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
                    elemento?.value ||
                    60
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
                    elemento?.value ||
                    7
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
        // FORMATAR TEMPO
        // ========================================================

        formatarTempo(segundos) {

            segundos =
                Math.max(
                    0,
                    Math.floor(
                        segundos
                    )
                );

            const minutos =
                Math.floor(
                    segundos / 60
                );

            const segundosRestantes =
                segundos % 60;

            return (
                String(minutos)
                    .padStart(2, "0") +
                ":" +
                String(
                    segundosRestantes
                ).padStart(2, "0")
            );

        }

        // ========================================================
        // DESTRUIR MÓDULO
        // ========================================================

        destroy() {

            /*
             * IMPORTANTE:
             *
             * O app.js remove a página atual
             * quando o usuário navega para outra aba.
             *
             * Aqui limpamos os timers da Partidas
             * para evitar cronômetros antigos
             * continuando em segundo plano.
             */

            this.pararCronometroPelada();

            this.pararCronometroPartida();

            console.log(
                "🧹 Módulo Partidas finalizado."
            );

        }

        // ========================================================
        // ESCAPAR HTML
        // ========================================================

        escaparHtml(valor) {

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

        mostrarErro(mensagem) {

            console.error(
                mensagem
            );

            if (
                typeof toast ===
                "function"
            ) {

                toast(
                    mensagem,
                    "#dc3545"
                );

                return;

            }

            alert(
                mensagem
            );

        }

    }

    // ============================================================
    // INICIAR MÓDULO
    // ============================================================

    window.Partidas =
        new Partidas();

})();