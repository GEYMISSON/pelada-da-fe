(function () {

    "use strict";


    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: HISTÓRICO
    // ============================================================

    class Historico {

        constructor() {

            this.partidas = [];

            this.gols = [];

            this.filtradas = [];

            this.modal = null;

            this.inicializar();

        }


        // ========================================================
        // INICIALIZAR
        // ========================================================

        inicializar() {

            console.log(
                "📚 Módulo Histórico iniciado."
            );


            this.inicializarModal();

            this.configurarEventos();

            this.carregarDados();

        }


        // ========================================================
        // MODAL
        // ========================================================

        inicializarModal() {

            const elemento =
                document.getElementById(
                    "modalDetalhesPartida"
                );


            if (
                elemento &&
                typeof bootstrap !== "undefined"
            ) {

                this.modal =
                    new bootstrap.Modal(
                        elemento
                    );

            }

        }


        // ========================================================
        // EVENTOS
        // ========================================================

        configurarEventos() {

            const dataInicial =
                document.getElementById(
                    "dataInicialHistorico"
                );

            const dataFinal =
                document.getElementById(
                    "dataFinalHistorico"
                );

            const filtroTime =
                document.getElementById(
                    "filtroTimeHistorico"
                );

            const filtroVencedor =
                document.getElementById(
                    "filtroVencedorHistorico"
                );

            const pesquisa =
                document.getElementById(
                    "pesquisaHistorico"
                );

            const btnLimpar =
                document.getElementById(
                    "btnLimparFiltrosHistorico"
                );


            [
                dataInicial,
                dataFinal,
                filtroTime,
                filtroVencedor,
                pesquisa
            ]
                .filter(Boolean)
                .forEach(
                    elemento => {

                        elemento.addEventListener(
                            "input",
                            () => {

                                this.aplicarFiltros();

                            }
                        );

                        elemento.addEventListener(
                            "change",
                            () => {

                                this.aplicarFiltros();

                            }
                        );

                    }
                );


            if (btnLimpar) {

                btnLimpar.addEventListener(
                    "click",
                    () => {

                        this.limparFiltros();

                    }
                );

            }


            const lista =
                document.getElementById(
                    "listaHistorico"
                );


            if (lista) {

                lista.addEventListener(
                    "click",
                    evento => {

                        const botao =
                            evento.target.closest(
                                "[data-acao-historico]"
                            );


                        if (!botao) {
                            return;
                        }


                        const acao =
                            botao.dataset.acaoHistorico;


                        const partidaId =
                            botao.dataset.partida;


                        if (
                            acao === "detalhes" &&
                            partidaId
                        ) {

                            this.mostrarDetalhes(
                                partidaId
                            );

                        }

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
                    "statusHistorico"
                );


            try {

                if (status) {

                    status.textContent =
                        "Carregando...";

                    status.className =
                        "badge bg-secondary fs-6";

                }


                const [
                    respostaPartidas,
                    respostaGols
                ] = await Promise.all([

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
                    )

                ]);


                let partidas = [];

                let gols = [];


                try {

                    partidas =
                        await respostaPartidas.json();

                } catch (erro) {

                    partidas = [];

                }


                try {

                    gols =
                        await respostaGols.json();

                } catch (erro) {

                    gols = [];

                }


                if (!respostaPartidas.ok) {

                    throw new Error(

                        partidas?.erro ||
                        partidas?.message ||
                        "Não foi possível carregar as partidas."

                    );

                }


                if (!respostaGols.ok) {

                    throw new Error(

                        gols?.erro ||
                        gols?.message ||
                        "Não foi possível carregar os gols."

                    );

                }


                if (
                    !Array.isArray(partidas)
                ) {

                    throw new Error(
                        "A API de partidas retornou um formato inválido."
                    );

                }


                if (
                    !Array.isArray(gols)
                ) {

                    throw new Error(
                        "A API de gols retornou um formato inválido."
                    );

                }


                this.partidas =
                    partidas.filter(
                        partida =>
                            partida.finalizada === true
                    );


                this.gols =
                    gols;


                this.partidas.sort(
                    (
                        partidaA,
                        partidaB
                    ) => {

                        return (
                            new Date(
                                partidaB.finalizadaEm ||
                                partidaB.createdAt ||
                                0
                            ) -

                            new Date(
                                partidaA.finalizadaEm ||
                                partidaA.createdAt ||
                                0
                            )
                        );

                    }
                );


                this.aplicarFiltros();


                if (status) {

                    status.textContent =
                        "Atualizado";

                    status.className =
                        "badge bg-success fs-6";

                }


            } catch (erro) {

                console.error(
                    "❌ Erro ao carregar histórico:",
                    erro
                );


                this.partidas = [];

                this.gols = [];

                this.filtradas = [];


                this.renderizar();


                if (status) {

                    status.textContent =
                        "Erro";

                    status.className =
                        "badge bg-danger fs-6";

                }


                const lista =
                    document.getElementById(
                        "listaHistorico"
                    );


                if (lista) {

                    lista.innerHTML = `

                        <tr>

                            <td
                                colspan="8"
                                class="text-center py-5"
                            >

                                <div class="alert alert-danger mb-0">

                                    <i
                                        class="bi bi-exclamation-triangle-fill me-2"
                                    ></i>

                                    ${this.escaparHtml(
                                        erro.message ||
                                        "Não foi possível carregar o histórico."
                                    )}

                                </div>

                            </td>

                        </tr>

                    `;

                }

            }

        }


        // ========================================================
        // FILTROS
        // ========================================================

        aplicarFiltros() {

            const dataInicial =
                document.getElementById(
                    "dataInicialHistorico"
                )?.value || "";


            const dataFinal =
                document.getElementById(
                    "dataFinalHistorico"
                )?.value || "";


            const filtroTime =
                document.getElementById(
                    "filtroTimeHistorico"
                )?.value || "";


            const filtroVencedor =
                document.getElementById(
                    "filtroVencedorHistorico"
                )?.value || "";


            const pesquisa =
                String(
                    document.getElementById(
                        "pesquisaHistorico"
                    )?.value || ""
                )
                    .trim()
                    .toLowerCase();


            this.filtradas =
                this.partidas.filter(
                    partida => {

                        const dataPartida =
                            this.obterDataLocalInput(
                                partida.finalizadaEm ||
                                partida.createdAt
                            );


                        // ----------------------------------------
                        // DATA INICIAL
                        // ----------------------------------------

                        if (
                            dataInicial &&
                            dataPartida < dataInicial
                        ) {

                            return false;

                        }


                        // ----------------------------------------
                        // DATA FINAL
                        // ----------------------------------------

                        if (
                            dataFinal &&
                            dataPartida > dataFinal
                        ) {

                            return false;

                        }


                        const nomeTimeA =
                            String(
                                partida.nomeTimeA || ""
                            );


                        const nomeTimeB =
                            String(
                                partida.nomeTimeB || ""
                            );


                        const nomeVencedor =
                            this.obterNomeVencedor(
                                partida
                            );


                        // ----------------------------------------
                        // FILTRO DE TIME
                        // ----------------------------------------

                        if (
                            filtroTime &&
                            nomeTimeA !== filtroTime &&
                            nomeTimeB !== filtroTime
                        ) {

                            return false;

                        }


                        // ----------------------------------------
                        // FILTRO DE VENCEDOR
                        // ----------------------------------------

                        if (
                            filtroVencedor &&
                            nomeVencedor !== filtroVencedor
                        ) {

                            return false;

                        }


                        // ----------------------------------------
                        // PESQUISA
                        // ----------------------------------------

                        if (pesquisa) {

                            const placar =
                                `${partida.golsTimeA || 0} x ${partida.golsTimeB || 0}`;


                            const texto =
                                [
                                    nomeTimeA,
                                    nomeTimeB,
                                    nomeVencedor,
                                    placar,
                                    String(
                                        partida.numero || ""
                                    )
                                ]
                                    .join(" ")
                                    .toLowerCase();


                            const golsPartida =
                                this.obterGolsPartida(
                                    partida._id
                                );


                            const jogadoresGols =
                                golsPartida
                                    .map(
                                        gol =>
                                            gol.nomeJogador ||
                                            gol.jogador?.nome ||
                                            ""
                                    )
                                    .join(" ")
                                    .toLowerCase();


                            if (
                                !texto.includes(
                                    pesquisa
                                ) &&
                                !jogadoresGols.includes(
                                    pesquisa
                                )
                            ) {

                                return false;

                            }

                        }


                        return true;

                    }
                );


            this.renderizar();

        }


        // ========================================================
        // LIMPAR FILTROS
        // ========================================================

        limparFiltros() {

            const elementos = [

                "dataInicialHistorico",
                "dataFinalHistorico",
                "filtroTimeHistorico",
                "filtroVencedorHistorico",
                "pesquisaHistorico"

            ];


            elementos.forEach(
                id => {

                    const elemento =
                        document.getElementById(
                            id
                        );


                    if (!elemento) {
                        return;
                    }


                    elemento.value = "";

                }
            );


            this.aplicarFiltros();

        }


        // ========================================================
        // RENDERIZAR
        // ========================================================

        renderizar() {

            const lista =
                document.getElementById(
                    "listaHistorico"
                );


            if (!lista) {
                return;
            }


            const totalPartidas =
                document.getElementById(
                    "totalPartidasHistorico"
                );


            const totalGols =
                document.getElementById(
                    "totalGolsHistorico"
                );


            const mediaGols =
                document.getElementById(
                    "mediaGolsHistorico"
                );


            const quantidadePartidas =
                this.filtradas.length;


            const quantidadeGols =
                this.filtradas.reduce(
                    (
                        total,
                        partida
                    ) => {

                        return (
                            total +
                            Number(
                                partida.golsTimeA || 0
                            ) +
                            Number(
                                partida.golsTimeB || 0
                            )
                        );

                    },
                    0
                );


            const media =
                quantidadePartidas > 0
                    ? quantidadeGols /
                      quantidadePartidas
                    : 0;


            if (totalPartidas) {

                totalPartidas.textContent =
                    quantidadePartidas;

            }


            if (totalGols) {

                totalGols.textContent =
                    quantidadeGols;

            }


            if (mediaGols) {

                mediaGols.textContent =
                    media.toFixed(2)
                        .replace(
                            ".",
                            ","
                        );

            }


            if (!this.filtradas.length) {

                lista.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            class="text-center text-muted py-5"
                        >

                            <i
                                class="bi bi-search fs-1 d-block mb-3"
                            ></i>

                            Nenhuma partida encontrada
                            com os filtros atuais.

                        </td>

                    </tr>

                `;

                return;

            }


            lista.innerHTML =
                this.filtradas
                    .map(
                        partida => {

                            const nomeTimeA =
                                partida.nomeTimeA ||
                                "Time A";


                            const nomeTimeB =
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


                            const vencedor =
                                this.obterNomeVencedor(
                                    partida
                                );


                            const data =
                                this.formatarData(
                                    partida.finalizadaEm ||
                                    partida.createdAt
                                );


                            const duracao =
                                this.formatarTempo(
                                    partida.duracaoSegundos ||
                                    0
                                );


                            const id =
                                String(
                                    partida._id || ""
                                );


                            return `

                                <tr>

                                    <td
                                        class="text-center"
                                    >

                                        <strong>
                                            ${partida.numero || "—"}
                                        </strong>

                                    </td>


                                    <td>

                                        ${data}

                                    </td>


                                    <td>

                                        ${this.escaparHtml(
                                            nomeTimeA
                                        )}

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <span
                                            class="badge bg-dark fs-6"
                                        >

                                            ${golsA} x ${golsB}

                                        </span>

                                    </td>


                                    <td>

                                        ${this.escaparHtml(
                                            nomeTimeB
                                        )}

                                    </td>


                                    <td>

                                        <span
                                            class="badge bg-success"
                                        >

                                            <i
                                                class="bi bi-trophy-fill me-1"
                                            ></i>

                                            ${this.escaparHtml(
                                                vencedor
                                            )}

                                        </span>

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        ${duracao}

                                    </td>


                                    <td
                                        class="text-center"
                                    >

                                        <button
                                            type="button"
                                            class="btn btn-sm btn-outline-success"
                                            data-acao-historico="detalhes"
                                            data-partida="${this.escaparHtml(id)}"
                                        >

                                            <i
                                                class="bi bi-eye-fill"
                                            ></i>

                                            Detalhes

                                        </button>

                                    </td>

                                </tr>

                            `;

                        }
                    )
                    .join("");

        }


        // ========================================================
        // DETALHES
        // ========================================================

        mostrarDetalhes(
            partidaId
        ) {

            const partida =
                this.partidas.find(
                    item =>
                        String(
                            item._id
                        ) ===
                        String(
                            partidaId
                        )
                );


            if (!partida) {

                return;

            }


            const titulo =
                document.getElementById(
                    "tituloDetalhesPartida"
                );


            const subtitulo =
                document.getElementById(
                    "subtituloDetalhesPartida"
                );


            const conteudo =
                document.getElementById(
                    "conteudoDetalhesPartida"
                );


            if (!conteudo) {
                return;
            }


            const nomeTimeA =
                partida.nomeTimeA ||
                "Time A";


            const nomeTimeB =
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


            const vencedor =
                this.obterNomeVencedor(
                    partida
                );


            const gols =
                this.obterGolsPartida(
                    partida._id
                );


            const golsTimeA =
                gols.filter(
                    gol =>
                        gol.time === nomeTimeA
                );


            const golsTimeB =
                gols.filter(
                    gol =>
                        gol.time === nomeTimeB
                );


            if (titulo) {

                titulo.textContent =
                    `Partida ${partida.numero || ""}`;

            }


            if (subtitulo) {

                subtitulo.textContent =
                    `${nomeTimeA} ${golsA} x ${golsB} ${nomeTimeB}`;

            }


            const renderizarGols =
                lista => {

                    if (!lista.length) {

                        return `

                            <div
                                class="text-muted"
                            >

                                Nenhum gol registrado.

                            </div>

                        `;

                    }


                    return `

                        <div
                            class="list-group"
                        >

                            ${
                                lista
                                    .map(
                                        gol => {

                                            const nomeJogador =
                                                gol.nomeJogador ||
                                                gol.jogador?.nome ||
                                                "Jogador";


                                            const minuto =
                                                Number(
                                                    gol.minuto ?? 0
                                                );


                                            return `

                                                <div
                                                    class="list-group-item d-flex justify-content-between align-items-center"
                                                >

                                                    <div>

                                                        <i
                                                            class="bi bi-person-fill text-success me-2"
                                                        ></i>

                                                        <strong>

                                                            ${this.escaparHtml(
                                                                nomeJogador
                                                            )}

                                                        </strong>

                                                    </div>

                                                    <span
                                                        class="badge bg-success"
                                                    >

                                                        ${minuto}'
                                                        
                                                    </span>

                                                </div>

                                            `;

                                        }
                                    )
                                    .join("")
                            }

                        </div>

                    `;

                };


            conteudo.innerHTML = `

                <div class="row g-3 mb-4">

                    <div class="col-12 col-md-4">

                        <div
                            class="border rounded p-3 h-100 text-center"
                        >

                            <small class="text-muted">
                                Time A
                            </small>

                            <h5 class="fw-bold mt-2">

                                ${this.escaparHtml(
                                    nomeTimeA
                                )}

                            </h5>

                            <div
                                class="display-6 fw-bold"
                            >

                                ${golsA}

                            </div>

                        </div>

                    </div>


                    <div class="col-12 col-md-4">

                        <div
                            class="border rounded p-3 h-100 text-center"
                        >

                            <small class="text-muted">
                                Resultado
                            </small>

                            <h5
                                class="fw-bold mt-2 text-success"
                            >

                                ${this.escaparHtml(
                                    vencedor
                                )}

                            </h5>

                            <div>

                                ${this.formatarData(
                                    partida.finalizadaEm ||
                                    partida.createdAt
                                )}

                            </div>

                        </div>

                    </div>


                    <div class="col-12 col-md-4">

                        <div
                            class="border rounded p-3 h-100 text-center"
                        >

                            <small class="text-muted">
                                Time B
                            </small>

                            <h5 class="fw-bold mt-2">

                                ${this.escaparHtml(
                                    nomeTimeB
                                )}

                            </h5>

                            <div
                                class="display-6 fw-bold"
                            >

                                ${golsB}

                            </div>

                        </div>

                    </div>

                </div>


                <div class="row g-4">

                    <div class="col-12 col-md-6">

                        <h6 class="fw-bold mb-3">

                            <i
                                class="bi bi-circle-fill text-warning me-2"
                            ></i>

                            Gols ${this.escaparHtml(
                                nomeTimeA
                            )}

                        </h6>

                        ${renderizarGols(
                            golsTimeA
                        )}

                    </div>


                    <div class="col-12 col-md-6">

                        <h6 class="fw-bold mb-3">

                            <i
                                class="bi bi-circle-fill text-primary me-2"
                            ></i>

                            Gols ${this.escaparHtml(
                                nomeTimeB
                            )}

                        </h6>

                        ${renderizarGols(
                            golsTimeB
                        )}

                    </div>

                </div>


                <hr class="my-4">


                <div class="row g-3">

                    <div class="col-12 col-md-4">

                        <small class="text-muted">
                            Duração
                        </small>

                        <div class="fw-bold">

                            ${this.formatarTempo(
                                partida.duracaoSegundos ||
                                0
                            )}

                        </div>

                    </div>


                    <div class="col-12 col-md-4">

                        <small class="text-muted">
                            Partida
                        </small>

                        <div class="fw-bold">

                            #${partida.numero || "—"}

                        </div>

                    </div>


                    <div class="col-12 col-md-4">

                        <small class="text-muted">
                            Total de gols
                        </small>

                        <div class="fw-bold">

                            ${golsA + golsB}

                        </div>

                    </div>

                </div>

            `;


            if (this.modal) {

                this.modal.show();

            }

        }


        // ========================================================
        // OBTER GOLS DA PARTIDA
        // ========================================================

        obterGolsPartida(
            partidaId
        ) {

            return this.gols.filter(
                gol =>
                    String(
                        gol.partida?._id ||
                        gol.partida
                    ) ===
                    String(
                        partidaId
                    )
            );

        }


        // ========================================================
        // VENCEDOR
        // ========================================================

        obterNomeVencedor(
            partida
        ) {

            if (
                partida.vencedor === "timeA"
            ) {

                return (
                    partida.nomeTimeA ||
                    "Time A"
                );

            }


            if (
                partida.vencedor === "timeB"
            ) {

                return (
                    partida.nomeTimeB ||
                    "Time B"
                );

            }


            return "—";

        }


        // ========================================================
        // DATA PARA INPUT
        // ========================================================

        obterDataLocalInput(
            data
        ) {

            if (!data) {
                return "";
            }


            const valor =
                new Date(
                    data
                );


            if (
                Number.isNaN(
                    valor.getTime()
                )
            ) {

                return "";

            }


            const ano =
                valor.getFullYear();


            const mes =
                String(
                    valor.getMonth() + 1
                )
                    .padStart(
                        2,
                        "0"
                    );


            const dia =
                String(
                    valor.getDate()
                )
                    .padStart(
                        2,
                        "0"
                    );


            return `${ano}-${mes}-${dia}`;

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


            const valor =
                new Date(
                    data
                );


            if (
                Number.isNaN(
                    valor.getTime()
                )
            ) {

                return "—";

            }


            return valor.toLocaleString(
                "pt-BR"
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
                    Number(
                        segundos || 0
                    )
                );


            const minutos =
                Math.floor(
                    segundos / 60
                );


            const segundosRestantes =
                Math.floor(
                    segundos % 60
                );


            return (

                String(
                    minutos
                )
                    .padStart(
                        2,
                        "0"
                    )

                +

                ":"

                +

                String(
                    segundosRestantes
                )
                    .padStart(
                        2,
                        "0"
                    )

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

            this.partidas = [];

            this.gols = [];

            this.filtradas = [];

            this.modal = null;


            console.log(
                "🧹 Módulo Histórico destruído."
            );

        }

    }


    window.Historico =
        new Historico();

})();