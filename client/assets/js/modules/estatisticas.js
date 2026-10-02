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

            this.gols = [];

            this.peladas = [];

            this.estatisticasJogadores = [];

            this.partidasPorJogador = {};

            this.golsPorJogador = {};

            this.filtroPeladaId = "";

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


            const filtroPelada =
                document.getElementById(
                    "filtroPeladaEstatisticas"
                );


            const btnLimpar =
                document.getElementById(
                    "btnLimparFiltroEstatisticas"
                );


            if (pesquisa) {

                pesquisa.addEventListener(
                    "input",
                    () => {

                        this.renderizar();

                    }
                );

            }


            if (filtroPelada) {

                filtroPelada.addEventListener(
                    "change",
                    () => {

                        this.filtroPeladaId =
                            filtroPelada.value || "";

                        this.processarDados();

                    }
                );

            }


            if (btnLimpar) {

                btnLimpar.addEventListener(
                    "click",
                    () => {

                        if (filtroPelada) {

                            filtroPelada.value = "";

                        }

                        this.filtroPeladaId = "";

                        this.processarDados();

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
                    respostaPartidas,
                    respostaGols,
                    respostaPeladas
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
                    ),

                    fetch(
                        "/api/gols",
                        {
                            cache: "no-store"
                        }
                    ),

                    fetch(
                        "/api/peladas",
                        {
                            cache: "no-store"
                        }
                    )

                ]);


                const dadosJogadores =
                    await this.lerJsonComSeguranca(
                        respostaJogadores
                    );


                const dadosPartidas =
                    await this.lerJsonComSeguranca(
                        respostaPartidas
                    );


                const dadosGols =
                    await this.lerJsonComSeguranca(
                        respostaGols
                    );


                const dadosPeladas =
                    await this.lerJsonComSeguranca(
                        respostaPeladas
                    );


                // ------------------------------------------------
                // VALIDAR JOGADORES
                // ------------------------------------------------

                if (!respostaJogadores.ok) {

                    throw new Error(

                        dadosJogadores?.erro ||
                        dadosJogadores?.message ||
                        "Não foi possível carregar os jogadores."

                    );

                }


                // ------------------------------------------------
                // VALIDAR PARTIDAS
                // ------------------------------------------------

                if (!respostaPartidas.ok) {

                    throw new Error(

                        dadosPartidas?.erro ||
                        dadosPartidas?.message ||
                        "Não foi possível carregar as partidas."

                    );

                }


                // ------------------------------------------------
                // VALIDAR GOLS
                // ------------------------------------------------

                if (!respostaGols.ok) {

                    throw new Error(

                        dadosGols?.erro ||
                        dadosGols?.message ||
                        "Não foi possível carregar os gols."

                    );

                }


                // ------------------------------------------------
                // VALIDAR PELADAS
                // ------------------------------------------------

                if (!respostaPeladas.ok) {

                    throw new Error(

                        dadosPeladas?.erro ||
                        dadosPeladas?.message ||
                        "Não foi possível carregar as peladas."

                    );

                }


                // ------------------------------------------------
                // VALIDAR FORMATO
                // ------------------------------------------------

                if (!Array.isArray(dadosJogadores)) {

                    throw new Error(
                        "A API de jogadores retornou um formato inválido."
                    );

                }


                if (!Array.isArray(dadosPartidas)) {

                    throw new Error(
                        "A API de partidas retornou um formato inválido."
                    );

                }


                if (!Array.isArray(dadosGols)) {

                    throw new Error(
                        "A API de gols retornou um formato inválido."
                    );

                }


                if (!Array.isArray(dadosPeladas)) {

                    throw new Error(
                        "A API de peladas retornou um formato inválido."
                    );

                }


                // ------------------------------------------------
                // JOGADORES
                // ------------------------------------------------

                this.jogadores =
                    dadosJogadores.map(
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


                // ------------------------------------------------
                // SOMENTE PARTIDAS FINALIZADAS
                // ------------------------------------------------

                this.partidas =
                    dadosPartidas.filter(
                        partida =>
                            partida.finalizada === true
                    );


                // ------------------------------------------------
                // GOLS
                // ------------------------------------------------

                this.gols =
                    dadosGols;


                // ------------------------------------------------
                // PELADAS
                // ------------------------------------------------

                this.peladas =
                    dadosPeladas;


                // ------------------------------------------------
                // PREENCHER FILTRO
                // ------------------------------------------------

                this.preencherFiltroPelada();


                // ------------------------------------------------
                // PROCESSAR
                // ------------------------------------------------

                this.processarDados();


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


                console.log(
                    "📅 Partidas finalizadas:",
                    this.partidas.length
                );


                console.log(
                    "⚽ Gols carregados:",
                    this.gols.length
                );


                console.log(
                    "🏆 Peladas carregadas:",
                    this.peladas.length
                );


            } catch (erro) {

                console.error(
                    "❌ Erro ao carregar estatísticas:",
                    erro
                );


                this.jogadores = [];

                this.partidas = [];

                this.gols = [];

                this.peladas = [];

                this.estatisticasJogadores = [];

                this.partidasPorJogador = {};

                this.golsPorJogador = {};


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
        // LER JSON COM SEGURANÇA
        // ========================================================

        async lerJsonComSeguranca(
            resposta
        ) {

            try {

                return await resposta.json();

            } catch (erro) {

                return null;

            }

        }


        // ========================================================
        // PREENCHER FILTRO POR PELADA
        // ========================================================

        preencherFiltroPelada() {

            const elemento =
                document.getElementById(
                    "filtroPeladaEstatisticas"
                );


            if (!elemento) {

                return;

            }


            const valorAtual =
                this.filtroPeladaId ||
                elemento.value ||
                "";


            const mapa =
                new Map();


            // ----------------------------------------------------
            // PELADAS CADASTRADAS
            // ----------------------------------------------------

            this.peladas
                .filter(
                    pelada =>
                        pelada &&
                        pelada._id
                )
                .forEach(
                    pelada => {

                        mapa.set(
                            String(
                                pelada._id
                            ),
                            pelada
                        );

                    }
                );


            // ----------------------------------------------------
            // PELADAS ENCONTRADAS NAS PARTIDAS
            // ----------------------------------------------------

            this.partidas.forEach(
                partida => {

                    const dados =
                        this.obterDadosPelada(
                            partida
                        );


                    if (
                        dados.id &&
                        !mapa.has(
                            dados.id
                        )
                    ) {

                        mapa.set(
                            dados.id,
                            {

                                _id:
                                    dados.id,

                                nome:
                                    dados.nome

                            }
                        );

                    }

                }
            );


            // ----------------------------------------------------
            // ORDENAR
            // ----------------------------------------------------

            const lista =
                Array.from(
                    mapa.values()
                ).sort(
                    (
                        peladaA,
                        peladaB
                    ) => {

                        return String(
                            peladaA.nome ||
                            "Pelada"
                        ).localeCompare(
                            String(
                                peladaB.nome ||
                                "Pelada"
                            ),
                            "pt-BR"
                        );

                    }
                );


            // ----------------------------------------------------
            // RECRIAR SELECT
            // ----------------------------------------------------

            elemento.innerHTML =
                `
                    <option value="">
                        Todas
                    </option>
                `;


            lista.forEach(
                pelada => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        String(
                            pelada._id
                        );


                    option.textContent =
                        pelada.nome ||
                        "Pelada sem nome";


                    elemento.appendChild(
                        option
                    );

                }
            );


            // ----------------------------------------------------
            // RESTAURAR SELEÇÃO
            // ----------------------------------------------------

            if (
                valorAtual &&
                mapa.has(
                    valorAtual
                )
            ) {

                elemento.value =
                    valorAtual;

                this.filtroPeladaId =
                    valorAtual;

            } else {

                elemento.value =
                    "";

                this.filtroPeladaId =
                    "";

            }

        }


        // ========================================================
        // OBTER DADOS DA PELADA
        // ========================================================

        obterDadosPelada(
            partida
        ) {

            if (!partida) {

                return {

                    id: "",

                    nome:
                        "Sem pelada vinculada"

                };

            }


            const pelada =
                partida.pelada;


            // ----------------------------------------------------
            // PELADA POPULADA
            // ----------------------------------------------------

            if (
                pelada &&
                typeof pelada === "object"
            ) {

                return {

                    id:
                        String(
                            pelada._id ||
                            pelada.id ||
                            ""
                        ),

                    nome:
                        pelada.nome ||
                        "Pelada sem nome"

                };

            }


            // ----------------------------------------------------
            // PELADA COMO ID
            // ----------------------------------------------------

            if (pelada) {

                const id =
                    String(
                        pelada
                    );


                const encontrada =
                    this.peladas.find(
                        item =>
                            String(
                                item?._id ||
                                ""
                            ) ===
                            id
                    );


                return {

                    id,

                    nome:
                        encontrada?.nome ||
                        "Pelada sem nome"

                };

            }


            return {

                id: "",

                nome:
                    "Sem pelada vinculada"

            };

        }


        // ========================================================
        // ATUALIZAR INDICADOR
        // ========================================================

        atualizarIndicadorPelada() {

            const indicador =
                document.getElementById(
                    "estatisticasPeladaSelecionada"
                );


            if (!indicador) {

                return;

            }


            if (!this.filtroPeladaId) {

                indicador.textContent =
                    "Todas as peladas";

                return;

            }


            const pelada =
                this.peladas.find(
                    item =>
                        String(
                            item?._id ||
                            ""
                        ) ===
                        String(
                            this.filtroPeladaId
                        )
                );


            indicador.textContent =
                pelada?.nome ||
                "Pelada selecionada";

        }


        // ========================================================
        // PROCESSAR DADOS
        // ========================================================

        processarDados() {

            const partidasFiltradas =
                this.filtrarPartidasPorPelada(
                    this.partidas
                );


            const golsFiltrados =
                this.obterGolsDasPartidas(
                    partidasFiltradas
                );


            this.calcularPartidasPorJogador(
                partidasFiltradas
            );


            this.calcularGolsPorJogador(
                golsFiltrados
            );


            this.calcularEstatisticas();


            this.atualizarIndicadorPelada();


            this.renderizar();

        }


        // ========================================================
        // FILTRAR PARTIDAS POR PELADA
        // ========================================================

        filtrarPartidasPorPelada(
            partidas
        ) {

            if (!this.filtroPeladaId) {

                return partidas;

            }


            return partidas.filter(
                partida => {

                    const dados =
                        this.obterDadosPelada(
                            partida
                        );


                    return (
                        dados.id ===
                        String(
                            this.filtroPeladaId
                        )
                    );

                }
            );

        }


        // ========================================================
        // OBTER GOLS DAS PARTIDAS
        // ========================================================

        obterGolsDasPartidas(
            partidas
        ) {

            const idsPartidas =
                new Set(

                    partidas
                        .map(
                            partida =>
                                String(
                                    partida?._id ||
                                    partida?.id ||
                                    ""
                                )
                        )
                        .filter(
                            Boolean
                        )

                );


            return this.gols.filter(
                gol => {

                    const partidaId =
                        String(
                            gol?.partida?._id ||
                            gol?.partida ||
                            ""
                        );


                    return idsPartidas.has(
                        partidaId
                    );

                }
            );

        }


        // ========================================================
        // CALCULAR GOLS POR JOGADOR
        // ========================================================

        calcularGolsPorJogador(
            golsFiltrados
        ) {

            this.golsPorJogador = {};


            golsFiltrados.forEach(
                gol => {

                    const jogadorId =
                        this.obterId(
                            gol?.jogador
                        );


                    if (!jogadorId) {

                        return;

                    }


                    if (
                        !this.golsPorJogador[
                            jogadorId
                        ]
                    ) {

                        this.golsPorJogador[
                            jogadorId
                        ] = 0;

                    }


                    this.golsPorJogador[
                        jogadorId
                    ]++;

                }
            );


            console.log(
                "⚽ Gols por jogador:",
                this.golsPorJogador
            );

        }


        // ========================================================
        // OBTER GOLS DO JOGADOR
        // ========================================================

        obterGolsJogador(
            jogadorId
        ) {

            if (!jogadorId) {

                return 0;

            }


            // ----------------------------------------------------
            // FILTRO POR PELADA
            // ----------------------------------------------------

            if (
                this.filtroPeladaId
            ) {

                return Number(

                    this.golsPorJogador[
                        String(
                            jogadorId
                        )
                    ] || 0

                );

            }


            // ----------------------------------------------------
            // TODAS AS PELADAS
            // ----------------------------------------------------

            const jogador =
                this.jogadores.find(
                    item =>
                        String(
                            item?._id ||
                            item?.id ||
                            ""
                        ) ===
                        String(
                            jogadorId
                        )
                );


            return Number(
                jogador?.gols || 0
            );

        }


        // ========================================================
        // CALCULAR PARTIDAS POR JOGADOR
        // ========================================================

        calcularPartidasPorJogador(
            partidas
        ) {

            this.partidasPorJogador = {};


            partidas.forEach(
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
                                    this.obterId(
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
                                    this.obterId(
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
                    // CONTAR UMA VEZ POR PARTIDA
                    // --------------------------------------------

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
        // CALCULAR ESTATÍSTICAS
        // ========================================================

        calcularEstatisticas() {

            const mapa =
                new Map();


            // ====================================================
            // CRIAR REGISTRO PARA TODOS OS JOGADORES
            // ====================================================

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
                                this.obterGolsJogador(
                                    id
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
                                0,

                            mediaGols:
                                0,

                            aproveitamento:
                                0

                        }
                    );

                }
            );


            // ====================================================
            // PROCESSAR PARTIDAS
            // ====================================================

            this.partidas
                .filter(
                    partida => {

                        const dados =
                            this.obterDadosPelada(
                                partida
                            );


                        if (
                            !this.filtroPeladaId
                        ) {

                            return true;

                        }


                        return (
                            dados.id ===
                            String(
                                this.filtroPeladaId
                            )
                        );

                    }
                )
                .forEach(
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


                        // ----------------------------------------
                        // TIME A
                        // ----------------------------------------

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
                                    vencedor ===
                                    "timeA"
                                ) {

                                    estatistica.vitorias++;

                                }


                                if (
                                    vencedor ===
                                    "timeB"
                                ) {

                                    estatistica.derrotas++;

                                }

                            }
                        );


                        // ----------------------------------------
                        // TIME B
                        // ----------------------------------------

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
                                    vencedor ===
                                    "timeB"
                                ) {

                                    estatistica.vitorias++;

                                }


                                if (
                                    vencedor ===
                                    "timeA"
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


            // ====================================================
            // ORDENAR
            // ====================================================

            /*
             * Ordem:
             *
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


            return [
                ...new Set(
                    ids
                )
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

            const partidasFiltradas =
                this.obterPartidasFiltradas();


            const totalGols =
                this.calcularTotalGols(
                    partidasFiltradas
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


            // ----------------------------------------------------
            // PARTIDAS
            // ----------------------------------------------------

            const elementoPartidas =
                document.getElementById(
                    "totalPartidasEstatisticas"
                );


            if (elementoPartidas) {

                elementoPartidas.textContent =
                    partidasFiltradas.length;

            }


            // ----------------------------------------------------
            // GOLS
            // ----------------------------------------------------

            const elementoGols =
                document.getElementById(
                    "totalGolsEstatisticas"
                );


            if (elementoGols) {

                elementoGols.textContent =
                    totalGols;

            }


            // ----------------------------------------------------
            // JOGADORES ATIVOS
            // ----------------------------------------------------

            const elementoJogadores =
                document.getElementById(
                    "totalJogadoresEstatisticas"
                );


            if (elementoJogadores) {

                elementoJogadores.textContent =
                    totalJogadoresAtivos;

            }


            // ----------------------------------------------------
            // PARTICIPANTES
            // ----------------------------------------------------

            const elementoParticipantes =
                document.getElementById(
                    "totalJogadoresParticipantes"
                );


            if (elementoParticipantes) {

                elementoParticipantes.textContent =
                    totalParticipantes;

            }


            // ----------------------------------------------------
            // QUANTIDADE
            // ----------------------------------------------------

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
                                <span
                                    class="fw-bold"
                                >
                                    ${posicao}
                                </span>
                                `;


                            // ------------------------------------------------
                            // 1º LUGAR
                            // ------------------------------------------------

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

                            }


                            // ------------------------------------------------
                            // 2º LUGAR
                            // ------------------------------------------------

                            else if (
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

                            }


                            // ------------------------------------------------
                            // 3º LUGAR
                            // ------------------------------------------------

                            else if (
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
                                                alt="${this.escaparHtml(
                                                    jogador.nome
                                                )}"
                                                class="rounded-circle border"
                                                style="
                                                    width:42px;
                                                    height:42px;
                                                    object-fit:cover;
                                                "
                                                onerror="
                                                    this.src='assets/img/avatar.png'
                                                "
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

                                            ${Number(
                                                jogador.mediaGols || 0
                                            ).toFixed(2)}

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
        // OBTER PARTIDAS FILTRADAS
        // ========================================================

        obterPartidasFiltradas() {

            if (
                !this.filtroPeladaId
            ) {

                return this.partidas;

            }


            return this.partidas.filter(
                partida => {

                    const dados =
                        this.obterDadosPelada(
                            partida
                        );


                    return (
                        dados.id ===
                        String(
                            this.filtroPeladaId
                        )
                    );

                }
            );

        }


        // ========================================================
        // CALCULAR TOTAL DE GOLS
        // ========================================================

        calcularTotalGols(
            partidas
        ) {

            // ----------------------------------------------------
            // COM FILTRO
            // ----------------------------------------------------

            if (
                this.filtroPeladaId
            ) {

                const golsFiltrados =
                    this.obterGolsDasPartidas(
                        partidas
                    );


                return golsFiltrados.length;

            }


            // ----------------------------------------------------
            // TODAS
            // ----------------------------------------------------

            return this.jogadores.reduce(
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


            this.jogadores = [];

            this.partidas = [];

            this.gols = [];

            this.peladas = [];

            this.estatisticasJogadores = [];

            this.partidasPorJogador = {};

            this.golsPorJogador = {};

            this.filtroPeladaId = "";

        }

    }


    // ============================================================
    // EVITAR DUPLICIDADE
    // ============================================================

    if (

        window.Estatisticas &&

        typeof window.Estatisticas.destroy ===
        "function"

    ) {

        try {

            window.Estatisticas.destroy();

        } catch (erro) {

            console.warn(
                "Erro ao destruir Estatísticas anterior:",
                erro
            );

        }

    }


    window.Estatisticas =
        new Estatisticas();

})();