(function () {

    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: DASHBOARD
    // ============================================================

    class Dashboard {

        constructor() {

            this.jogadores = [];

            this.partidas = [];

            this.gols = [];

            this.inicializar();

        }


        // ========================================================
        // INICIALIZAÇÃO
        // ========================================================

        async inicializar() {

            console.log(
                "📊 Dashboard iniciado."
            );

            this.configurarEventos();

            await this.carregarDados();

        }


        // ========================================================
        // EVENTOS
        // ========================================================

        configurarEventos() {

            const botao =
                document.getElementById(
                    "btnAtualizarDashboard"
                );


            if (botao) {

                botao.addEventListener(
                    "click",
                    async () => {

                        await this.carregarDados();

                    }
                );

            }

        }


        // ========================================================
        // CARREGAR DADOS
        // ========================================================

        async carregarDados() {

            this.atualizarStatus(
                "Carregando...",
                "bg-secondary"
            );


            try {

                const [
                    respostaJogadores,
                    respostaPartidas,
                    respostaGols
                ] = await Promise.all([

                    fetch("/api/jogadores"),

                    fetch("/api/partidas"),

                    fetch("/api/gols")

                ]);


                if (!respostaJogadores.ok) {

                    throw new Error(
                        "Erro ao carregar jogadores."
                    );

                }


                if (!respostaPartidas.ok) {

                    throw new Error(
                        "Erro ao carregar partidas."
                    );

                }


                if (!respostaGols.ok) {

                    throw new Error(
                        "Erro ao carregar gols."
                    );

                }


                this.jogadores =
                    await respostaJogadores.json();


                this.partidas =
                    await respostaPartidas.json();


                this.gols =
                    await respostaGols.json();


                this.processarDados();


                this.atualizarStatus(
                    "Atualizado",
                    "bg-success"
                );


            } catch (erro) {

                console.error(
                    "Erro no dashboard:",
                    erro
                );


                this.atualizarStatus(
                    "Erro",
                    "bg-danger"
                );


                this.mostrarErro(
                    erro.message
                );

            }

        }


        // ========================================================
        // PROCESSAR DADOS
        // ========================================================

        processarDados() {

            const jogadoresAtivos =
                this.jogadores.filter(
                    jogador =>
                        jogador.status === "Ativo"
                );


            const partidasFinalizadas =
                this.partidas.filter(
                    partida =>
                        partida.finalizada === true
                );


            this.atualizarCards(
                jogadoresAtivos,
                partidasFinalizadas
            );


            this.renderizarGolsPorTime(
                partidasFinalizadas
            );


            this.renderizarDesempenhoTimes(
                partidasFinalizadas
            );


            this.renderizarArtilheiros(
                jogadoresAtivos
            );


            this.renderizarUltimasPartidas(
                partidasFinalizadas
            );

        }


        // ========================================================
        // CARDS
        // ========================================================

        atualizarCards(
            jogadoresAtivos,
            partidasFinalizadas
        ) {

            const totalJogadores =
                document.getElementById(
                    "dashboardTotalJogadores"
                );


            const totalPartidas =
                document.getElementById(
                    "dashboardTotalPartidas"
                );


            const totalGols =
                document.getElementById(
                    "dashboardTotalGols"
                );


            const artilheiro =
                document.getElementById(
                    "dashboardArtilheiro"
                );


            const golsArtilheiro =
                document.getElementById(
                    "dashboardGolsArtilheiro"
                );


            const quantidadeGols =
                partidasFinalizadas.reduce(
                    (
                        total,
                        partida
                    ) => {

                        return total +
                            Number(
                                partida.golsTimeA || 0
                            ) +
                            Number(
                                partida.golsTimeB || 0
                            );

                    },
                    0
                );


            const ranking =
                [...jogadoresAtivos]
                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const golsA =
                                Number(
                                    a.gols || 0
                                );


                            const golsB =
                                Number(
                                    b.gols || 0
                                );


                            if (
                                golsB !== golsA
                            ) {

                                return (
                                    golsB -
                                    golsA
                                );

                            }


                            return (
                                a.nome || ""
                            )
                                .localeCompare(
                                    b.nome || "",
                                    "pt-BR"
                                );

                        }
                    );


            const primeiro =
                ranking[0];


            if (totalJogadores) {

                totalJogadores.textContent =
                    jogadoresAtivos.length;

            }


            if (totalPartidas) {

                totalPartidas.textContent =
                    partidasFinalizadas.length;

            }


            if (totalGols) {

                totalGols.textContent =
                    quantidadeGols;

            }


            if (artilheiro) {

                artilheiro.textContent =
                    primeiro
                        ? primeiro.nome
                        : "---";

            }


            if (golsArtilheiro) {

                golsArtilheiro.textContent =
                    primeiro
                        ? `${Number(
                            primeiro.gols || 0
                        )} gols`
                        : "0 gols";

            }

        }


        // ========================================================
        // GOLS POR TIME
        // ========================================================

        renderizarGolsPorTime(
            partidas
        ) {

            const area =
                document.getElementById(
                    "graficoGolsTimes"
                );


            if (!area) {

                return;

            }


            const times = {};


            partidas.forEach(
                partida => {

                    const nomeA =
                        partida.nomeTimeA ||
                        "Time A";


                    const nomeB =
                        partida.nomeTimeB ||
                        "Time B";


                    const golsA =
                        Number(
                            partida.golsTimeA || 0
                        );


                    const golsB =
                        Number(
                            partida.golsTimeB || 0
                        );


                    if (
                        !times[nomeA]
                    ) {

                        times[nomeA] = 0;

                    }


                    if (
                        !times[nomeB]
                    ) {

                        times[nomeB] = 0;

                    }


                    times[nomeA] += golsA;

                    times[nomeB] += golsB;

                }
            );


            const ranking =
                Object.entries(times)
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            b[1] - a[1]
                    );


            if (!ranking.length) {

                area.innerHTML = this.mensagemVazia(
                    "Nenhum gol registrado."
                );

                return;

            }


            const maiorValor =
                Math.max(
                    ...ranking.map(
                        item =>
                            item[1]
                    ),
                    1
                );


            area.innerHTML =
                ranking.map(
                    (
                        [nome, gols]
                    ) => {

                        const percentual =
                            (
                                gols /
                                maiorValor
                            ) *
                            100;


                        return `

                            <div class="mb-3">

                                <div
                                    class="d-flex justify-content-between
                                           align-items-center mb-1"
                                >

                                    <strong>
                                        ${this.escaparHtml(nome)}
                                    </strong>

                                    <span class="fw-bold">
                                        ${gols}
                                    </span>

                                </div>

                                <div
                                    class="progress"
                                    style="height:14px;"
                                >

                                    <div
                                        class="progress-bar bg-primary"
                                        role="progressbar"
                                        style="width:${percentual}%"
                                    ></div>

                                </div>

                            </div>

                        `;

                    }
                ).join("");

        }


        // ========================================================
        // DESEMPENHO DOS TIMES
        // ========================================================

        renderizarDesempenhoTimes(
            partidas
        ) {

            const area =
                document.getElementById(
                    "graficoDesempenhoTimes"
                );


            if (!area) {

                return;

            }


            const times = {};


            partidas.forEach(
                partida => {

                    const nomeA =
                        partida.nomeTimeA ||
                        "Time A";


                    const nomeB =
                        partida.nomeTimeB ||
                        "Time B";


                    if (!times[nomeA]) {

                        times[nomeA] = {

                            vitorias: 0,

                            derrotas: 0

                        };

                    }


                    if (!times[nomeB]) {

                        times[nomeB] = {

                            vitorias: 0,

                            derrotas: 0

                        };

                    }


                    if (
                        partida.vencedor ===
                        "timeA"
                    ) {

                        times[nomeA].vitorias++;

                        times[nomeB].derrotas++;

                    }


                    if (
                        partida.vencedor ===
                        "timeB"
                    ) {

                        times[nomeB].vitorias++;

                        times[nomeA].derrotas++;

                    }

                }
            );


            const ranking =
                Object.entries(times);


            if (!ranking.length) {

                area.innerHTML = this.mensagemVazia(
                    "Nenhuma partida finalizada."
                );

                return;

            }


            const maiorValor =
                Math.max(

                    ...ranking.map(
                        ([, dados]) =>
                            Math.max(
                                dados.vitorias,
                                dados.derrotas
                            )
                    ),

                    1

                );


            area.innerHTML =
                ranking.map(
                    (
                        [nome, dados]
                    ) => {

                        const larguraVitorias =
                            (
                                dados.vitorias /
                                maiorValor
                            ) *
                            100;


                        const larguraDerrotas =
                            (
                                dados.derrotas /
                                maiorValor
                            ) *
                            100;


                        return `

                            <div class="mb-4">

                                <div class="fw-bold mb-2">

                                    ${this.escaparHtml(nome)}

                                </div>


                                <div
                                    class="d-flex align-items-center gap-2 mb-2"
                                >

                                    <span
                                        class="text-success fw-bold"
                                        style="width:75px;"
                                    >
                                        Vitórias
                                    </span>

                                    <div
                                        class="progress flex-grow-1"
                                        style="height:12px;"
                                    >

                                        <div
                                            class="progress-bar bg-success"
                                            style="width:${larguraVitorias}%"
                                        ></div>

                                    </div>

                                    <span
                                        class="fw-bold"
                                        style="width:30px;"
                                    >
                                        ${dados.vitorias}
                                    </span>

                                </div>


                                <div
                                    class="d-flex align-items-center gap-2"
                                >

                                    <span
                                        class="text-danger fw-bold"
                                        style="width:75px;"
                                    >
                                        Derrotas
                                    </span>

                                    <div
                                        class="progress flex-grow-1"
                                        style="height:12px;"
                                    >

                                        <div
                                            class="progress-bar bg-danger"
                                            style="width:${larguraDerrotas}%"
                                        ></div>

                                    </div>

                                    <span
                                        class="fw-bold"
                                        style="width:30px;"
                                    >
                                        ${dados.derrotas}
                                    </span>

                                </div>

                            </div>

                        `;

                    }
                ).join("");

        }


        // ========================================================
        // TOP ARTILHEIROS
        // ========================================================

        renderizarArtilheiros(
            jogadores
        ) {

            const area =
                document.getElementById(
                    "rankingArtilheiros"
                );


            if (!area) {

                return;

            }


            const ranking =
                [...jogadores]
                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const golsA =
                                Number(
                                    a.gols || 0
                                );


                            const golsB =
                                Number(
                                    b.gols || 0
                                );


                            if (
                                golsB !== golsA
                            ) {

                                return (
                                    golsB -
                                    golsA
                                );

                            }


                            const assistA =
                                Number(
                                    a.assistencias || 0
                                );


                            const assistB =
                                Number(
                                    b.assistencias || 0
                                );


                            if (
                                assistB !== assistA
                            ) {

                                return (
                                    assistB -
                                    assistA
                                );

                            }


                            return (
                                a.nome || ""
                            )
                                .localeCompare(
                                    b.nome || "",
                                    "pt-BR"
                                );

                        }
                    )
                    .slice(
                        0,
                        5
                    );


            if (!ranking.length) {

                area.innerHTML =
                    this.mensagemVazia(
                        "Nenhum jogador encontrado."
                    );

                return;

            }


            area.innerHTML =
                ranking.map(
                    (
                        jogador,
                        indice
                    ) => {

                        const gols =
                            Number(
                                jogador.gols || 0
                            );


                        const assistencias =
                            Number(
                                jogador.assistencias || 0
                            );


                        return `

                            <div
                                class="d-flex align-items-center
                                       justify-content-between
                                       border-bottom py-3"
                            >

                                <div
                                    class="d-flex align-items-center"
                                >

                                    <div
                                        class="rounded-circle
                                               bg-primary
                                               text-white
                                               d-flex
                                               align-items-center
                                               justify-content-center
                                               fw-bold
                                               me-3"
                                        style="
                                            width:38px;
                                            height:38px;
                                        "
                                    >
                                        ${indice + 1}
                                    </div>


                                    <div>

                                        <div class="fw-bold">
                                            ${this.escaparHtml(
                                                jogador.nome
                                            )}
                                        </div>

                                        <small
                                            class="text-muted"
                                        >
                                            ${this.escaparHtml(
                                                jogador.posicao ||
                                                "Sem posição"
                                            )}
                                        </small>

                                    </div>

                                </div>


                                <div class="text-end">

                                    <div
                                        class="fw-bold text-primary"
                                    >
                                        ${gols} gols
                                    </div>

                                    <small
                                        class="text-muted"
                                    >
                                        ${assistencias}
                                        assistência${assistencias === 1 ? "" : "s"}
                                    </small>

                                </div>

                            </div>

                        `;

                    }
                ).join("");

        }


        // ========================================================
        // ÚLTIMAS PARTIDAS
        // ========================================================

        renderizarUltimasPartidas(
            partidas
        ) {

            const area =
                document.getElementById(
                    "ultimasPartidas"
                );


            if (!area) {

                return;

            }


            const ultimas =
                [...partidas]
                    .sort(
                        (
                            a,
                            b
                        ) => {

                            const dataA =
                                new Date(
                                    a.finalizadaEm ||
                                    a.createdAt ||
                                    0
                                );


                            const dataB =
                                new Date(
                                    b.finalizadaEm ||
                                    b.createdAt ||
                                    0
                                );


                            return (
                                dataB - dataA
                            );

                        }
                    )
                    .slice(
                        0,
                        5
                    );


            if (!ultimas.length) {

                area.innerHTML =
                    this.mensagemVazia(
                        "Nenhuma partida finalizada."
                    );

                return;

            }


            area.innerHTML =
                ultimas.map(
                    partida => {

                        const golsA =
                            Number(
                                partida.golsTimeA || 0
                            );


                        const golsB =
                            Number(
                                partida.golsTimeB || 0
                            );


                        const venceuA =
                            partida.vencedor ===
                            "timeA";


                        const venceuB =
                            partida.vencedor ===
                            "timeB";


                        const data =
                            this.formatarData(
                                partida.finalizadaEm ||
                                partida.createdAt
                            );


                        return `

                            <div
                                class="border-bottom py-3"
                            >

                                <div
                                    class="d-flex
                                           justify-content-between
                                           align-items-center
                                           gap-2"
                                >

                                    <div
                                        class="
                                            text-truncate
                                            ${venceuA
                                                ? "fw-bold"
                                                : ""}
                                        "
                                    >
                                        ${this.escaparHtml(
                                            partida.nomeTimeA ||
                                            "Time A"
                                        )}
                                    </div>


                                    <div
                                        class="
                                            fw-bold
                                            fs-5
                                            text-nowrap
                                        "
                                    >
                                        ${golsA}
                                        x
                                        ${golsB}
                                    </div>


                                    <div
                                        class="
                                            text-end
                                            text-truncate
                                            ${venceuB
                                                ? "fw-bold"
                                                : ""}
                                        "
                                    >
                                        ${this.escaparHtml(
                                            partida.nomeTimeB ||
                                            "Time B"
                                        )}
                                    </div>

                                </div>


                                <div
                                    class="
                                        d-flex
                                        justify-content-between
                                        mt-1
                                    "
                                >

                                    <small
                                        class="text-muted"
                                    >
                                        ${data}
                                    </small>


                                    <small
                                        class="text-success"
                                    >
                                        ${this.escaparHtml(
                                            this.obterNomeVencedor(
                                                partida
                                            )
                                        )}
                                    </small>

                                </div>

                            </div>

                        `;

                    }
                ).join("");

        }


        // ========================================================
        // NOME DO VENCEDOR
        // ========================================================

        obterNomeVencedor(
            partida
        ) {

            if (
                partida.vencedor ===
                "timeA"
            ) {

                return (
                    partida.nomeTimeA ||
                    "Time A"
                );

            }


            if (
                partida.vencedor ===
                "timeB"
            ) {

                return (
                    partida.nomeTimeB ||
                    "Time B"
                );

            }


            return "Sem vencedor";

        }


        // ========================================================
        // DATA
        // ========================================================

        formatarData(
            valor
        ) {

            if (!valor) {

                return "--";

            }


            const data =
                new Date(valor);


            if (
                Number.isNaN(
                    data.getTime()
                )
            ) {

                return "--";

            }


            return data.toLocaleDateString(
                "pt-BR"
            );

        }


        // ========================================================
        // STATUS
        // ========================================================

        atualizarStatus(
            texto,
            classe
        ) {

            const status =
                document.getElementById(
                    "statusDashboard"
                );


            if (!status) {

                return;

            }


            status.className =
                `badge ${classe}`;


            status.textContent =
                texto;

        }


        // ========================================================
        // MENSAGEM VAZIA
        // ========================================================

        mensagemVazia(
            texto
        ) {

            return `

                <div
                    class="
                        text-center
                        text-muted
                        py-4
                    "
                >

                    <i
                        class="
                            bi
                            bi-bar-chart
                            fs-2
                            d-block
                            mb-2
                        "
                    ></i>

                    ${this.escaparHtml(texto)}

                </div>

            `;

        }


        // ========================================================
        // ESCAPAR HTML
        // ========================================================

        escaparHtml(
            valor
        ) {

            return String(
                valor ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        // ========================================================
        // ERRO
        // ========================================================

        mostrarErro(
            mensagem
        ) {

            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire({

                    icon: "error",

                    title: "Dashboard",

                    text:
                        mensagem ||
                        "Não foi possível carregar os dados."

                });

                return;

            }


            alert(
                mensagem ||
                "Não foi possível carregar os dados."
            );

        }


        // ========================================================
        // DESTROY
        // ========================================================

        destroy() {

            this.jogadores = [];

            this.partidas = [];

            this.gols = [];

        }

    }


    // ============================================================
    // EVITAR DUPLICIDADE
    // ============================================================

    if (
        window.Dashboard &&
        typeof window.Dashboard.destroy ===
        "function"
    ) {

        try {

            window.Dashboard.destroy();

        } catch (erro) {

            console.warn(
                "Erro ao destruir Dashboard anterior:",
                erro
            );

        }

    }


    window.Dashboard =
        new Dashboard();


})();