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

            this.gols = [];

            this.peladas = [];

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

            const filtroPelada =
                document.getElementById(
                    "filtroPeladaArtilharia"
                );

            const btnLimpar =
                document.getElementById(
                    "btnLimparFiltroArtilharia"
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
                    "statusArtilharia"
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
                // VALIDAR RESPOSTAS
                // ------------------------------------------------

                if (!respostaJogadores.ok) {

                    throw new Error(

                        dadosJogadores?.erro ||
                        dadosJogadores?.message ||
                        "Não foi possível carregar os jogadores."

                    );

                }


                if (!respostaPartidas.ok) {

                    throw new Error(

                        dadosPartidas?.erro ||
                        dadosPartidas?.message ||
                        "Não foi possível carregar as partidas."

                    );

                }


                if (!respostaGols.ok) {

                    throw new Error(

                        dadosGols?.erro ||
                        dadosGols?.message ||
                        "Não foi possível carregar os gols."

                    );

                }


                if (!respostaPeladas.ok) {

                    throw new Error(

                        dadosPeladas?.erro ||
                        dadosPeladas?.message ||
                        "Não foi possível carregar as peladas."

                    );

                }


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
                // MONTAR FILTRO
                // ------------------------------------------------

                this.preencherFiltroPelada();


                // ------------------------------------------------
                // PROCESSAR
                // ------------------------------------------------

                this.processarDados();


                // ------------------------------------------------
                // STATUS
                // ------------------------------------------------

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
                    "❌ Erro ao carregar artilharia:",
                    erro
                );


                this.jogadores = [];

                this.partidas = [];

                this.gols = [];

                this.peladas = [];

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
                        "listaArtilharia"
                    );


                if (lista) {

                    lista.innerHTML = `

                        <tr>

                            <td
                                colspan="6"
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
                    "filtroPeladaArtilharia"
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
            // GARANTIR PELADAS ENCONTRADAS NAS PARTIDAS
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
            // ORDENAR POR NOME
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
        // NOME DA PELADA
        // ========================================================

        obterNomePelada(
            partida
        ) {

            return this.obterDadosPelada(
                partida
            ).nome;

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
        // OBTER GOLS DAS PARTIDAS FILTRADAS
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
        // ATUALIZAR INDICADOR DA PELADA
        // ========================================================

        atualizarIndicadorPelada() {

            const indicador =
                document.getElementById(
                    "artilhariaPeladaSelecionada"
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
        // CALCULAR PARTIDAS POR JOGADOR
        // ========================================================

        calcularPartidasPorJogador(
            partidas = this.partidas
        ) {

            this.partidasPorJogador =
                {};


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
        // CALCULAR GOLS POR JOGADOR
        // ========================================================

        calcularGolsPorJogador(
            golsFiltrados
        ) {

            this.golsPorJogador =
                {};


            golsFiltrados.forEach(
                gol => {

                    const jogadorId =
                        this.obterIdReferencia(
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
            // COM FILTRO POR PELADA
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
                    String(
                        jogadorId
                    )
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
                this.obterGolsJogador(
                    jogador._id
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


            return (
                gols /
                partidas
            );

        }


        // ========================================================
        // ORDENAR ARTILHARIA
        // ========================================================

        ordenarJogadores(
            jogadores
        ) {

            return jogadores.sort(

                (
                    jogadorA,
                    jogadorB
                ) => {

                    const golsA =
                        this.obterGolsJogador(
                            jogadorA._id
                        );


                    const golsB =
                        this.obterGolsJogador(
                            jogadorB._id
                        );


                    // --------------------------------------------
                    // 1º CRITÉRIO: GOLS
                    // --------------------------------------------

                    if (
                        golsA !==
                        golsB
                    ) {

                        return (
                            golsB -
                            golsA
                        );

                    }


                    // --------------------------------------------
                    // 2º CRITÉRIO: ASSISTÊNCIAS
                    // --------------------------------------------

                    const assistenciasA =
                        Number(
                            jogadorA.assistencias || 0
                        );


                    const assistenciasB =
                        Number(
                            jogadorB.assistencias || 0
                        );


                    if (
                        assistenciasA !==
                        assistenciasB
                    ) {

                        return (
                            assistenciasB -
                            assistenciasA
                        );

                    }


                    // --------------------------------------------
                    // 3º CRITÉRIO: PARTIDAS
                    // --------------------------------------------

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


                    // --------------------------------------------
                    // 4º CRITÉRIO: NOME
                    // --------------------------------------------

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


            // ----------------------------------------------------
            // ORDENAR TODOS
            // ----------------------------------------------------

            const jogadoresOrdenados =
                this.ordenarJogadores(

                    [
                        ...this.jogadores
                    ]

                );


            // ----------------------------------------------------
            // APLICAR PESQUISA
            // ----------------------------------------------------

            const jogadoresFiltrados =
                jogadoresOrdenados.filter(

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

                            this.obterGolsJogador(
                                jogador._id
                            )

                        );

                    },

                    0

                );


            const jogadoresComGol =
                this.jogadores.filter(

                    jogador =>

                        this.obterGolsJogador(
                            jogador._id
                        ) > 0

                ).length;


            const artilheiro =
                jogadoresOrdenados.find(

                    jogador =>

                        this.obterGolsJogador(
                            jogador._id
                        ) > 0

                ) || null;


            // ----------------------------------------------------
            // TOTAL DE GOLS
            // ----------------------------------------------------

            const totalGolsElemento =
                document.getElementById(
                    "totalGolsArtilharia"
                );


            if (totalGolsElemento) {

                totalGolsElemento.textContent =
                    totalGols;

            }


            // ----------------------------------------------------
            // NOME DO ARTILHEIRO
            // ----------------------------------------------------

            const nomeArtilheiro =
                document.getElementById(
                    "nomeArtilheiro"
                );


            if (nomeArtilheiro) {

                nomeArtilheiro.textContent =
                    artilheiro?.nome ||
                    "—";

            }


            // ----------------------------------------------------
            // GOLS DO ARTILHEIRO
            // ----------------------------------------------------

            const golsArtilheiro =
                document.getElementById(
                    "golsArtilheiro"
                );


            if (golsArtilheiro) {

                const gols =
                    this.obterGolsJogador(
                        artilheiro?._id
                    );


                golsArtilheiro.textContent =
                    `${gols} ${
                        gols === 1
                            ? "gol"
                            : "gols"
                    }`;

            }


            // ----------------------------------------------------
            // JOGADORES COM GOL
            // ----------------------------------------------------

            const jogadoresComGolElemento =
                document.getElementById(
                    "jogadoresComGol"
                );


            if (jogadoresComGolElemento) {

                jogadoresComGolElemento.textContent =
                    jogadoresComGol;

            }


            // ----------------------------------------------------
            // QUANTIDADE
            // ----------------------------------------------------

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
                                this.obterGolsJogador(
                                    jogador._id
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
                                                    jogador.nome ||
                                                    "Jogador"
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
                                            class="
                                                d-flex
                                                flex-column
                                                align-items-center
                                                gap-1
                                            "
                                        >

                                            <span
                                                class="badge bg-primary"
                                            >

                                                ${assistencias}
                                                assist.

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


        // ========================================================
        // DESTROY
        // ========================================================

        destroy() {

            this.jogadores = [];

            this.partidas = [];

            this.gols = [];

            this.peladas = [];

            this.partidasPorJogador = {};

            this.golsPorJogador = {};

            this.filtroPeladaId = "";

        }

    }


    // ============================================================
    // EVITAR DUPLICIDADE
    // ============================================================

    if (

        window.Artilharia &&

        typeof window.Artilharia.destroy ===
        "function"

    ) {

        try {

            window.Artilharia.destroy();

        } catch (erro) {

            console.warn(
                "Erro ao destruir Artilharia anterior:",
                erro
            );

        }

    }


    window.Artilharia =
        new Artilharia();

})();