(function () {

    "use strict";


    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: ARTILHARIA
    // ============================================================

    class Artilharia {

        constructor() {

            this.jogadores = [];

            this.partidas = [];

            this.partidasPorJogador = {};

            this.inicializar();

        }


        // ========================================================
        // INICIALIZAR
        // ========================================================

        inicializar() {

            console.log(
                "⚽ Módulo Artilharia iniciado."
            );

            this.configurarEventos();

            this.carregarDados();

        }


        // ========================================================
        // EVENTOS
        // ========================================================

        configurarEventos() {

            const pesquisa =
                document.getElementById(
                    "pesquisaArtilharia"
                );


            if (pesquisa) {

                pesquisa.addEventListener(
                    "input",
                    () => {

                        this.renderizar();

                    }
                );

            }

        }


        // ========================================================
        // CARREGAR DADOS
        // ========================================================

        async carregarDados() {

            const status =
                document.getElementById(
                    "statusArtilharia"
                );


            try {

                if (status) {

                    status.textContent =
                        "Carregando...";

                    status.className =
                        "badge bg-secondary fs-6";

                }


                // ------------------------------------------------
                // CARREGAR JOGADORES E PARTIDAS
                // ------------------------------------------------

                const [
                    respostaJogadores,
                    respostaPartidas
                ] = await Promise.all([

                    fetch(
                        "/api/jogadores",
                        {
                            cache: "no-store"
                        }
                    ),

                    fetch(
                        "/api/partidas",
                        {
                            cache: "no-store"
                        }
                    )

                ]);


                let jogadores = [];

                let partidas = [];


                try {

                    jogadores =
                        await respostaJogadores.json();

                } catch (erro) {

                    jogadores = [];

                }


                try {

                    partidas =
                        await respostaPartidas.json();

                } catch (erro) {

                    partidas = [];

                }


                // ------------------------------------------------
                // VERIFICAR RESPOSTAS
                // ------------------------------------------------

                if (!respostaJogadores.ok) {

                    throw new Error(

                        jogadores?.erro ||
                        jogadores?.message ||
                        "Não foi possível carregar os jogadores."

                    );

                }


                if (!respostaPartidas.ok) {

                    throw new Error(

                        partidas?.erro ||
                        partidas?.message ||
                        "Não foi possível carregar as partidas."

                    );

                }


                if (!Array.isArray(jogadores)) {

                    throw new Error(
                        "A API de jogadores retornou um formato inválido."
                    );

                }


                if (!Array.isArray(partidas)) {

                    throw new Error(
                        "A API de partidas retornou um formato inválido."
                    );

                }


                this.jogadores =
                    jogadores.map(
                        jogador => ({

                            ...jogador,

                            gols:
                                Number(
                                    jogador.gols || 0
                                ),

                            assistencias:
                                Number(
                                    jogador.assistencias || 0
                                )

                        })
                    );


                /*
                 * Consideramos somente partidas finalizadas
                 * para calcular partidas oficialmente disputadas.
                 */
                this.partidas =
                    partidas.filter(
                        partida =>
                            partida.finalizada === true
                    );


                // ------------------------------------------------
                // CALCULAR PARTIDAS POR JOGADOR
                // ------------------------------------------------

                this.calcularPartidasPorJogador();


                // ------------------------------------------------
                // ORDENAR ARTILHARIA
                // ------------------------------------------------

                this.jogadores.sort(
                    (
                        jogadorA,
                        jogadorB
                    ) => {

                        const golsA =
                            Number(
                                jogadorA.gols || 0
                            );

                        const golsB =
                            Number(
                                jogadorB.gols || 0
                            );


                        // 1º critério: gols
                        if (
                            golsA !== golsB
                        ) {

                            return (
                                golsB -
                                golsA
                            );

                        }


                        const assistenciasA =
                            Number(
                                jogadorA.assistencias || 0
                            );

                        const assistenciasB =
                            Number(
                                jogadorB.assistencias || 0
                            );


                        // 2º critério: assistências
                        if (
                            assistenciasA !==
                            assistenciasB
                        ) {

                            return (
                                assistenciasB -
                                assistenciasA
                            );

                        }


                        // 3º critério: partidas
                        const partidasA =
                            this.obterPartidasJogador(
                                jogadorA._id
                            );

                        const partidasB =
                            this.obterPartidasJogador(
                                jogadorB._id
                            );


                        if (
                            partidasA !==
                            partidasB
                        ) {

                            return (
                                partidasB -
                                partidasA
                            );

                        }


                        // 4º critério: nome
                        return String(
                            jogadorA.nome || ""
                        ).localeCompare(
                            String(
                                jogadorB.nome || ""
                            ),
                            "pt-BR"
                        );

                    }
                );


                this.renderizar();


                if (status) {

                    status.textContent =
                        "Atualizado";

                    status.className =
                        "badge bg-success fs-6";

                }


                console.log(
                    "⚽ Artilharia carregada:",
                    this.jogadores
                );


                console.log(
                    "📊 Partidas finalizadas:",
                    this.partidas.length
                );


            } catch (erro) {

                console.error(
                    "❌ Erro ao carregar artilharia:",
                    erro
                );


                this.jogadores = [];

                this.partidas = [];

                this.partidasPorJogador = {};


                this.renderizar();


                if (status) {

                    status.textContent =
                        "Erro";

                    status.className =
                        "badge bg-danger fs-6";

                }


                const lista =
                    document.getElementById(
                        "listaArtilharia"
                    );


                if (lista) {

                    lista.innerHTML = `

                        <tr>

                            <td
                                colspan="6"
                                class="text-center py-5"
                            >

                                <div class="alert alert-danger mb-0">

                                    <i
                                        class="bi bi-exclamation-triangle-fill me-2"
                                    ></i>

                                    ${this.escaparHtml(
                                        erro.message ||
                                        "Não foi possível carregar a artilharia."
                                    )}

                                </div>

                            </td>

                        </tr>

                    `;

                }

            }

        }


        // ========================================================
        // CALCULAR PARTIDAS POR JOGADOR
        // ========================================================

        calcularPartidasPorJogador() {

            this.partidasPorJogador = {};


            this.partidas.forEach(
                partida => {

                    const jogadoresPartida =
                        new Set();


                    // --------------------------------------------
                    // TIME A
                    // --------------------------------------------

                    if (
                        Array.isArray(
                            partida.jogadoresTimeA
                        )
                    ) {

                        partida.jogadoresTimeA.forEach(
                            jogador => {

                                const id =
                                    this.obterIdReferencia(
                                        jogador
                                    );


                                if (id) {

                                    jogadoresPartida.add(
                                        id
                                    );

                                }

                            }
                        );

                    }


                    // --------------------------------------------
                    // TIME B
                    // --------------------------------------------

                    if (
                        Array.isArray(
                            partida.jogadoresTimeB
                        )
                    ) {

                        partida.jogadoresTimeB.forEach(
                            jogador => {

                                const id =
                                    this.obterIdReferencia(
                                        jogador
                                    );


                                if (id) {

                                    jogadoresPartida.add(
                                        id
                                    );

                                }

                            }
                        );

                    }


                    /*
                     * Set evita contar o mesmo jogador duas vezes
                     * dentro da mesma partida.
                     */

                    jogadoresPartida.forEach(
                        jogadorId => {

                            if (
                                !this.partidasPorJogador[
                                    jogadorId
                                ]
                            ) {

                                this.partidasPorJogador[
                                    jogadorId
                                ] = 0;

                            }


                            this.partidasPorJogador[
                                jogadorId
                            ]++;

                        }
                    );

                }
            );


            console.log(
                "📊 Partidas por jogador:",
                this.partidasPorJogador
            );

        }


        // ========================================================
        // OBTER ID DE REFERÊNCIA
        // ========================================================

        obterIdReferencia(
            jogador
        ) {

            if (!jogador) {
                return null;
            }


            if (
                typeof jogador === "string"
            ) {

                return String(
                    jogador
                );

            }


            if (
                typeof jogador === "object"
            ) {

                return String(

                    jogador._id ||
                    jogador.id ||
                    ""

                );

            }


            return null;

        }


        // ========================================================
        // OBTER PARTIDAS DO JOGADOR
        // ========================================================

        obterPartidasJogador(
            jogadorId
        ) {

            if (!jogadorId) {

                return 0;

            }


            return Number(

                this.partidasPorJogador[
                    String(jogadorId)
                ] || 0

            );

        }


        // ========================================================
        // MÉDIA DE GOLS
        // ========================================================

        calcularMediaGols(
            jogador
        ) {

            const gols =
                Number(
                    jogador.gols || 0
                );


            const partidas =
                this.obterPartidasJogador(
                    jogador._id
                );


            if (
                partidas <= 0
            ) {

                return 0;

            }


            return gols / partidas;

        }


        // ========================================================
        // RENDERIZAR
        // ========================================================

        renderizar() {

            const lista =
                document.getElementById(
                    "listaArtilharia"
                );


            if (!lista) {
                return;
            }


            const pesquisa =
                document.getElementById(
                    "pesquisaArtilharia"
                );


            const termo =
                String(
                    pesquisa?.value || ""
                )
                    .trim()
                    .toLowerCase();


            const jogadoresFiltrados =
                this.jogadores.filter(
                    jogador => {

                        const nome =
                            String(
                                jogador.nome || ""
                            )
                                .toLowerCase();


                        const posicao =
                            String(
                                jogador.posicao || ""
                            )
                                .toLowerCase();


                        return (

                            !termo ||

                            nome.includes(
                                termo
                            ) ||

                            posicao.includes(
                                termo
                            )

                        );

                    }
                );


            // ====================================================
            // RESUMO
            // ====================================================

            const totalGols =
                this.jogadores.reduce(
                    (
                        total,
                        jogador
                    ) => {

                        return (

                            total +

                            Number(
                                jogador.gols || 0
                            )

                        );

                    },
                    0
                );


            const jogadoresComGol =
                this.jogadores.filter(
                    jogador =>
                        Number(
                            jogador.gols || 0
                        ) > 0
                ).length;


            const artilheiro =
                this.jogadores.length > 0
                    ? this.jogadores[0]
                    : null;


            const totalGolsElemento =
                document.getElementById(
                    "totalGolsArtilharia"
                );


            if (totalGolsElemento) {

                totalGolsElemento.textContent =
                    totalGols;

            }


            const nomeArtilheiro =
                document.getElementById(
                    "nomeArtilheiro"
                );


            if (nomeArtilheiro) {

                nomeArtilheiro.textContent =
                    artilheiro?.nome ||
                    "—";

            }


            const golsArtilheiro =
                document.getElementById(
                    "golsArtilheiro"
                );


            if (golsArtilheiro) {

                const gols =
                    Number(
                        artilheiro?.gols || 0
                    );


                golsArtilheiro.textContent =
                    `${gols} ${
                        gols === 1
                            ? "gol"
                            : "gols"
                    }`;

            }


            const jogadoresComGolElemento =
                document.getElementById(
                    "jogadoresComGol"
                );


            if (jogadoresComGolElemento) {

                jogadoresComGolElemento.textContent =
                    jogadoresComGol;

            }


            const quantidadeJogadores =
                document.getElementById(
                    "quantidadeJogadoresArtilharia"
                );


            if (quantidadeJogadores) {

                quantidadeJogadores.textContent =
                    `${jogadoresFiltrados.length} ${
                        jogadoresFiltrados.length === 1
                            ? "jogador"
                            : "jogadores"
                    }`;

            }


            // ====================================================
            // LISTA VAZIA
            // ====================================================

            if (
                !jogadoresFiltrados.length
            ) {

                lista.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="text-center text-muted py-5"
                        >

                            <i
                                class="bi bi-search fs-1 d-block mb-3"
                            ></i>

                            Nenhum jogador encontrado.

                        </td>

                    </tr>

                `;

                return;

            }


            // ====================================================
            // TABELA
            // ====================================================

            lista.innerHTML =
                jogadoresFiltrados
                    .map(
                        (
                            jogador,
                            indice
                        ) => {

                            const posicao =
                                indice + 1;


                            const gols =
                                Number(
                                    jogador.gols || 0
                                );


                            const assistencias =
                                Number(
                                    jogador.assistencias || 0
                                );


                            const partidas =
                                this.obterPartidasJogador(
                                    jogador._id
                                );


                            const media =
                                this.calcularMediaGols(
                                    jogador
                                );


                            let classificacao =
                                `
                                <span class="fw-bold">
                                    ${posicao}
                                </span>
                                `;


                            if (
                                posicao === 1
                            ) {

                                classificacao =
                                    `
                                    <span
                                        class="badge bg-warning text-dark fs-6"
                                    >
                                        🥇
                                    </span>
                                    `;

                            } else if (
                                posicao === 2
                            ) {

                                classificacao =
                                    `
                                    <span
                                        class="badge bg-secondary fs-6"
                                    >
                                        🥈
                                    </span>
                                    `;

                            } else if (
                                posicao === 3
                            ) {

                                classificacao =
                                    `
                                    <span
                                        class="badge bg-danger fs-6"
                                    >
                                        🥉
                                    </span>
                                    `;

                            }


                            const foto =
                                jogador.foto ||
                                "assets/img/avatar.png";


                            return `

                                <tr>

                                    <td
                                        class="text-center"
                                    >

                                        ${classificacao}

                                    </td>


                                    <td>

                                        <div
                                            class="d-flex align-items-center gap-3"
                                        >

                                            <img
                                                src="${this.escaparHtml(foto)}"
                                                alt="${this.escaparHtml(jogador.nome || "Jogador")}"
                                                class="rounded-circle border"
                                                style="
                                                    width:42px;
                                                    height:42px;
                                                    object-fit:cover;
                                                "
                                                onerror="this.src='assets/img/avatar.png'"
                                            >

                                            <div>

                                                <div
                                                    class="fw-bold"
                                                >

                                                    ${this.escaparHtml(
                                                        jogador.nome ||
                                                        "Jogador"
                                                    )}

                                                </div>

                                                <small
                                                    class="text-muted"
                                                >

                                                    ${this.escaparHtml(
                                                        jogador.status ||
                                                        "Ativo"
                                                    )}

                                                </small>

                                            </div>

                                        </div>

                                    </td>


                                    <td>

                                        ${
                                            this.escaparHtml(
                                                jogador.posicao ||
                                                "—"
                                            )
                                        }

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-dark"
                                        >

                                            ${partidas}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-success fs-6 px-3"
                                        >

                                            ${gols}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <div
                                            class="d-flex flex-column align-items-center gap-1"
                                        >

                                            <span
                                                class="badge bg-primary"
                                            >

                                                ${assistencias} assist.

                                            </span>


                                            <small
                                                class="text-muted"
                                            >

                                                ${media.toFixed(2)}
                                                gol/partida

                                            </small>

                                        </div>

                                    </td>

                                </tr>

                            `;

                        }
                    )
                    .join("");

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

    }


    window.Artilharia =
        new Artilharia();

})();