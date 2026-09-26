(function () {

    "use strict";


    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: ESTATÍSTICAS
    // ============================================================

    class Estatisticas {

        constructor() {

            this.jogadores = [];

            this.partidas = [];

            this.estatisticasJogadores = [];

            this.inicializar();

        }


        // ========================================================
        // INICIALIZAR
        // ========================================================

        inicializar() {

            console.log(
                "📊 Módulo Estatísticas iniciado."
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
                    "pesquisaEstatisticas"
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
                    "statusEstatisticas"
                );


            try {

                if (status) {

                    status.textContent =
                        "Carregando...";

                    status.className =
                        "badge bg-secondary fs-6";

                }


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
                 * Somente partidas finalizadas entram
                 * nas estatísticas.
                 */
                this.partidas =
                    partidas.filter(
                        partida =>
                            partida.finalizada === true
                    );


                this.calcularEstatisticas();


                this.renderizar();


                if (status) {

                    status.textContent =
                        "Atualizado";

                    status.className =
                        "badge bg-success fs-6";

                }


                console.log(
                    "📊 Estatísticas carregadas:",
                    this.estatisticasJogadores
                );


            } catch (erro) {

                console.error(
                    "❌ Erro ao carregar estatísticas:",
                    erro
                );


                this.estatisticasJogadores = [];


                this.renderizar();


                if (status) {

                    status.textContent =
                        "Erro";

                    status.className =
                        "badge bg-danger fs-6";

                }


                const lista =
                    document.getElementById(
                        "listaEstatisticas"
                    );


                if (lista) {

                    lista.innerHTML = `

                        <tr>

                            <td
                                colspan="10"
                                class="text-center py-5"
                            >

                                <div
                                    class="alert alert-danger mb-0"
                                >

                                    <i
                                        class="bi bi-exclamation-triangle-fill me-2"
                                    ></i>

                                    ${this.escaparHtml(
                                        erro.message ||
                                        "Não foi possível carregar as estatísticas."
                                    )}

                                </div>

                            </td>

                        </tr>

                    `;

                }

            }

        }


        // ========================================================
        // CALCULAR ESTATÍSTICAS
        // ========================================================

        calcularEstatisticas() {

            /*
             * Começamos com todos os jogadores cadastrados.
             */
            const mapa =
                new Map();


            this.jogadores.forEach(
                jogador => {

                    const id =
                        this.obterId(
                            jogador
                        );


                    if (!id) {
                        return;
                    }


                    mapa.set(
                        id,
                        {

                            id,

                            nome:
                                jogador.nome ||
                                "Jogador",

                            foto:
                                jogador.foto ||
                                "",

                            posicao:
                                jogador.posicao ||
                                "",

                            status:
                                jogador.status ||
                                "Ativo",

                            gols:
                                Number(
                                    jogador.gols || 0
                                ),

                            assistencias:
                                Number(
                                    jogador.assistencias || 0
                                ),

                            partidas:
                                0,

                            vitorias:
                                0,

                            derrotas:
                                0

                        }
                    );

                }
            );


            // ====================================================
            // PROCESSAR PARTIDAS
            // ====================================================

            this.partidas.forEach(
                partida => {

                    const jogadoresTimeA =
                        this.obterIdsJogadores(
                            partida.jogadoresTimeA
                        );


                    const jogadoresTimeB =
                        this.obterIdsJogadores(
                            partida.jogadoresTimeB
                        );


                    const vencedor =
                        partida.vencedor;


                    // --------------------------------------------
                    // TIME A
                    // --------------------------------------------

                    jogadoresTimeA.forEach(
                        jogadorId => {

                            const estatistica =
                                mapa.get(
                                    jogadorId
                                );


                            if (!estatistica) {
                                return;
                            }


                            estatistica.partidas++;


                            if (
                                vencedor === "timeA"
                            ) {

                                estatistica.vitorias++;

                            } else if (
                                vencedor === "timeB"
                            ) {

                                estatistica.derrotas++;

                            }

                        }
                    );


                    // --------------------------------------------
                    // TIME B
                    // --------------------------------------------

                    jogadoresTimeB.forEach(
                        jogadorId => {

                            const estatistica =
                                mapa.get(
                                    jogadorId
                                );


                            if (!estatistica) {
                                return;
                            }


                            estatistica.partidas++;


                            if (
                                vencedor === "timeB"
                            ) {

                                estatistica.vitorias++;

                            } else if (
                                vencedor === "timeA"
                            ) {

                                estatistica.derrotas++;

                            }

                        }
                    );

                }
            );


            // ====================================================
            // FINALIZAR CÁLCULOS
            // ====================================================

            this.estatisticasJogadores =
                Array.from(
                    mapa.values()
                );


            this.estatisticasJogadores.forEach(
                estatistica => {

                    if (
                        estatistica.partidas > 0
                    ) {

                        estatistica.mediaGols =
                            estatistica.gols /
                            estatistica.partidas;


                        estatistica.aproveitamento =
                            (
                                estatistica.vitorias /
                                estatistica.partidas
                            ) * 100;

                    } else {

                        estatistica.mediaGols =
                            0;

                        estatistica.aproveitamento =
                            0;

                    }

                }
            );


            /*
             * Ordem:
             * 1. Vitórias
             * 2. Aproveitamento
             * 3. Gols
             * 4. Partidas
             * 5. Nome
             */
            this.estatisticasJogadores.sort(
                (
                    jogadorA,
                    jogadorB
                ) => {

                    if (
                        jogadorA.vitorias !==
                        jogadorB.vitorias
                    ) {

                        return (
                            jogadorB.vitorias -
                            jogadorA.vitorias
                        );

                    }


                    if (
                        jogadorA.aproveitamento !==
                        jogadorB.aproveitamento
                    ) {

                        return (
                            jogadorB.aproveitamento -
                            jogadorA.aproveitamento
                        );

                    }


                    if (
                        jogadorA.gols !==
                        jogadorB.gols
                    ) {

                        return (
                            jogadorB.gols -
                            jogadorA.gols
                        );

                    }


                    if (
                        jogadorA.partidas !==
                        jogadorB.partidas
                    ) {

                        return (
                            jogadorB.partidas -
                            jogadorA.partidas
                        );

                    }


                    return String(
                        jogadorA.nome
                    ).localeCompare(
                        String(
                            jogadorB.nome
                        ),
                        "pt-BR"
                    );

                }
            );

        }


        // ========================================================
        // OBTER IDs DOS JOGADORES
        // ========================================================

        obterIdsJogadores(
            jogadores
        ) {

            if (
                !Array.isArray(
                    jogadores
                )
            ) {

                return [];

            }


            const ids =
                jogadores
                    .map(
                        jogador =>
                            this.obterId(
                                jogador
                            )
                    )
                    .filter(
                        id => !!id
                    );


            /*
             * Evita contar duas vezes o mesmo jogador
             * caso o MongoDB retorne IDs repetidos.
             */
            return [
                ...new Set(ids)
            ];

        }


        // ========================================================
        // OBTER ID
        // ========================================================

        obterId(
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

                if (jogador._id) {

                    return String(
                        jogador._id
                    );

                }


                if (jogador.id) {

                    return String(
                        jogador.id
                    );

                }

            }


            return null;

        }


        // ========================================================
        // RENDERIZAR
        // ========================================================

        renderizar() {

            const lista =
                document.getElementById(
                    "listaEstatisticas"
                );


            if (!lista) {
                return;
            }


            const pesquisa =
                document.getElementById(
                    "pesquisaEstatisticas"
                );


            const termo =
                String(
                    pesquisa?.value || ""
                )
                    .trim()
                    .toLowerCase();


            const filtrados =
                this.estatisticasJogadores.filter(
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
            // RESUMOS
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


            const totalJogadoresAtivos =
                this.jogadores.filter(
                    jogador =>
                        jogador.status === "Ativo"
                ).length;


            const totalParticipantes =
                this.estatisticasJogadores.filter(
                    jogador =>
                        jogador.partidas > 0
                ).length;


            const elementoPartidas =
                document.getElementById(
                    "totalPartidasEstatisticas"
                );


            if (elementoPartidas) {

                elementoPartidas.textContent =
                    this.partidas.length;

            }


            const elementoGols =
                document.getElementById(
                    "totalGolsEstatisticas"
                );


            if (elementoGols) {

                elementoGols.textContent =
                    totalGols;

            }


            const elementoJogadores =
                document.getElementById(
                    "totalJogadoresEstatisticas"
                );


            if (elementoJogadores) {

                elementoJogadores.textContent =
                    totalJogadoresAtivos;

            }


            const elementoParticipantes =
                document.getElementById(
                    "totalJogadoresParticipantes"
                );


            if (elementoParticipantes) {

                elementoParticipantes.textContent =
                    totalParticipantes;

            }


            const quantidade =
                document.getElementById(
                    "quantidadeEstatisticas"
                );


            if (quantidade) {

                quantidade.textContent =
                    `${filtrados.length} ${
                        filtrados.length === 1
                            ? "jogador"
                            : "jogadores"
                    }`;

            }


            // ====================================================
            // SEM RESULTADOS
            // ====================================================

            if (
                !filtrados.length
            ) {

                lista.innerHTML = `

                    <tr>

                        <td
                            colspan="10"
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
                filtrados
                    .map(
                        (
                            jogador,
                            indice
                        ) => {

                            const posicao =
                                indice + 1;


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


                            const aproveitamento =
                                Number(
                                    jogador.aproveitamento ||
                                    0
                                );


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
                                                alt="${this.escaparHtml(jogador.nome)}"
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
                                                        jogador.nome
                                                    )}

                                                </div>

                                                <small
                                                    class="text-muted"
                                                >

                                                    ${this.escaparHtml(
                                                        jogador.status
                                                    )}

                                                </small>

                                            </div>

                                        </div>

                                    </td>


                                    <td>

                                        ${this.escaparHtml(
                                            jogador.posicao ||
                                            "—"
                                        )}

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-dark"
                                        >

                                            ${jogador.partidas}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-success"
                                        >

                                            ${jogador.vitorias}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-danger"
                                        >

                                            ${jogador.derrotas}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-success fs-6"
                                        >

                                            ${jogador.gols}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-primary"
                                        >

                                            ${jogador.assistencias}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="fw-bold"
                                        >

                                            ${jogador.mediaGols.toFixed(2)}

                                        </span>

                                        <small
                                            class="text-muted d-block"
                                        >
                                            gol/partida
                                        </small>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-info text-dark"
                                        >

                                            ${aproveitamento.toFixed(1)}%

                                        </span>

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


        // ========================================================
        // DESTROY
        // ========================================================

        destroy() {

            console.log(
                "🧹 Módulo Estatísticas destruído."
            );

        }

    }


    window.Estatisticas =
        new Estatisticas();

})();