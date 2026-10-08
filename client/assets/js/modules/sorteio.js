(function () {

    "use strict";


    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: SORTEIO DE TIMES
    // ============================================================

    class Sorteio {

        constructor() {

            this.jogadores = [];

            this.jogadoresFiltrados = [];


            this.times = {

                amarelo: [],

                vermelho: [],

                azul: []

            };


            // ====================================================
            // PELADA ATUAL
            // ====================================================

            this.peladaAtualId = "";

            this.peladaAtual = null;

            this.peladaValida = false;


            // ====================================================
            // CONFIGURAÇÃO DA PELADA
            // ====================================================

            this.duracaoPelada = 60;

            this.duracaoPartida = 7;


            this.inicializar();

        }


        // ========================================================
        // INICIALIZAÇÃO
        // ========================================================

        async inicializar() {

            console.log(
                "⚽ Módulo Sorteio iniciado."
            );


            this.configurarEventos();


            this.configurarDuracoes();


            await this.carregarPeladaAtual();


            await this.carregarJogadores();


            this.validarSorteioSalvo();

        }


        // ========================================================
        // EVENTOS
        // ========================================================

        configurarEventos() {

            const btnSortear =
                document.getElementById(
                    "btnSortear"
                );


            const pesquisa =
                document.getElementById(
                    "pesquisaSorteio"
                );


            // ----------------------------------------------------
            // Botão sortear
            // ----------------------------------------------------

            if (btnSortear) {

                btnSortear.addEventListener(
                    "click",
                    () => {

                        this.sortear();

                    }
                );

            }


            // ----------------------------------------------------
            // Pesquisa
            // ----------------------------------------------------

            if (pesquisa) {

                pesquisa.addEventListener(
                    "input",
                    () => {

                        this.filtrarJogadores(
                            pesquisa.value
                        );

                    }
                );

            }

        }


        // ========================================================
        // CARREGAR PELADA ATUAL
        // ========================================================

        async carregarPeladaAtual() {

            const idSalvo =
                localStorage.getItem(
                    "peladaDaFePeladaAtualId"
                );


            // ----------------------------------------------------
            // Nenhuma Pelada selecionada
            // ----------------------------------------------------

            if (!idSalvo) {

                this.peladaAtualId = "";

                this.peladaAtual = null;

                this.peladaValida = false;


                this.atualizarIndicadorPelada();


                this.atualizarBotaoSortear();


                return;

            }


            try {

                const resposta =
                    await fetch(
                        "/api/peladas",
                        {
                            cache: "no-store"
                        }
                    );


                if (!resposta.ok) {

                    throw new Error(
                        "Não foi possível carregar as peladas."
                    );

                }


                const peladas =
                    await resposta.json();


                if (
                    !Array.isArray(
                        peladas
                    )
                ) {

                    throw new Error(
                        "A API de peladas retornou um formato inválido."
                    );

                }


                const pelada =
                    peladas.find(
                        item =>
                            String(
                                item?._id ||
                                ""
                            ) ===
                            String(
                                idSalvo
                            )
                    );


                // ------------------------------------------------
                // Pelada não encontrada
                // ------------------------------------------------

                if (!pelada) {

                    this.peladaAtualId = "";

                    this.peladaAtual = null;

                    this.peladaValida = false;


                    localStorage.removeItem(
                        "peladaDaFePeladaAtualId"
                    );


                    localStorage.removeItem(
                        "peladaDaFePeladaAtual"
                    );


                    this.limparSorteioSalvo();


                    this.atualizarIndicadorPelada();


                    this.atualizarBotaoSortear();


                    return;

                }


                this.peladaAtualId =
                    String(
                        pelada._id
                    );


                this.peladaAtual =
                    pelada;


                this.peladaValida =
                    this.validarStatusPelada(
                        pelada
                    );


                this.atualizarIndicadorPelada();


                this.atualizarBotaoSortear();


                console.log(
                    "🏆 Pelada atual do Sorteio:",
                    pelada
                );


            } catch (erro) {

                console.error(
                    "Erro ao carregar Pelada atual:",
                    erro
                );


                this.peladaAtualId =
                    String(
                        idSalvo
                    );


                this.peladaAtual = null;

                this.peladaValida = false;


                this.atualizarIndicadorPelada();


                this.atualizarBotaoSortear();

            }

        }


        // ========================================================
        // VALIDAR STATUS DA PELADA
        // ========================================================

        validarStatusPelada(
            pelada
        ) {

            if (!pelada) {

                return false;

            }


            const status =
                String(
                    pelada.status ||
                    ""
                );


            if (
                status === "Finalizada" ||
                status === "Cancelada"
            ) {

                return false;

            }


            return true;

        }


        // ========================================================
        // ATUALIZAR INDICADOR DA PELADA
        // ========================================================

        atualizarIndicadorPelada() {

            const nome =
                document.getElementById(
                    "sorteioPeladaSelecionada"
                );


            const status =
                document.getElementById(
                    "sorteioPeladaStatus"
                );


            const badge =
                document.getElementById(
                    "badgePeladaSorteio"
                );


            if (
                !this.peladaAtualId
            ) {

                if (nome) {

                    nome.textContent =
                        "Nenhuma Pelada selecionada";

                }


                if (status) {

                    status.textContent =
                        "Selecione uma Pelada em Peladas antes de realizar o sorteio.";

                    status.className =
                        "text-danger";

                }


                if (badge) {

                    badge.textContent =
                        "Sem Pelada";

                    badge.className =
                        "badge bg-danger fs-6";

                }


                return;

            }


            if (
                !this.peladaAtual
            ) {

                if (nome) {

                    nome.textContent =
                        "Carregando Pelada...";

                }


                if (status) {

                    status.textContent =
                        "Verificando Pelada selecionada...";

                    status.className =
                        "text-muted";

                }


                if (badge) {

                    badge.textContent =
                        "Aguardando";

                    badge.className =
                        "badge bg-secondary fs-6";

                }


                return;

            }


            if (nome) {

                nome.textContent =
                    this.peladaAtual.nome ||
                    "Pelada sem nome";

            }


            const statusPelada =
                String(
                    this.peladaAtual.status ||
                    "Agendada"
                );


            if (status) {

                status.textContent =
                    `${statusPelada} • ${this.formatarDataHoraPelada()}`;

                status.className =
                    this.peladaValida
                        ? "text-success"
                        : "text-danger";

            }


            if (badge) {

                if (
                    !this.peladaValida
                ) {

                    badge.textContent =
                        "Indisponível";

                    badge.className =
                        "badge bg-danger fs-6";

                } else if (
                    statusPelada === "Em andamento"
                ) {

                    badge.textContent =
                        "Em andamento";

                    badge.className =
                        "badge bg-success fs-6";

                } else {

                    badge.textContent =
                        "Agendada";

                    badge.className =
                        "badge bg-primary fs-6";

                }

            }

        }


        // ========================================================
        // FORMATAR DATA/HORA DA PELADA
        // ========================================================

        formatarDataHoraPelada() {

            if (
                !this.peladaAtual
            ) {

                return "Data não informada";

            }


            let dataFormatada =
                "Data não informada";


            if (
                this.peladaAtual.data
            ) {

                const data =
                    new Date(
                        this.peladaAtual.data
                    );


                if (
                    !Number.isNaN(
                        data.getTime()
                    )
                ) {

                    dataFormatada =
                        data.toLocaleDateString(
                            "pt-BR"
                        );

                }

            }


            const horario =
                this.peladaAtual.horario ||
                "";


            if (horario) {

                return (
                    dataFormatada +
                    " • " +
                    horario
                );

            }


            return dataFormatada;

        }


        // ========================================================
        // ATUALIZAR BOTÃO SORTear
        // ========================================================

        atualizarBotaoSortear() {

            const botao =
                document.getElementById(
                    "btnSortear"
                );


            if (!botao) {

                return;

            }


            if (
                !this.peladaValida
            ) {

                botao.disabled =
                    true;


                botao.title =
                    "Selecione uma Pelada válida antes de realizar o sorteio.";

                return;

            }


            botao.disabled =
                false;


            botao.removeAttribute(
                "title"
            );

        }


        // ========================================================
        // VALIDAR SORTEIO SALVO
        // ========================================================

        validarSorteioSalvo() {

            const peladaSorteioId =
                localStorage.getItem(
                    "peladaDaFeTimesPeladaId"
                );


            const dadosSalvos =
                localStorage.getItem(
                    "peladaDaFeTimes"
                );


            // ----------------------------------------------------
            // Não existe sorteio salvo
            // ----------------------------------------------------

            if (!dadosSalvos) {

                this.limparTimes();

                return;

            }


            // ----------------------------------------------------
            // Não existe Pelada atual
            // ----------------------------------------------------

            if (
                !this.peladaAtualId
            ) {

                this.limparSorteioSalvo();

                return;

            }


            // ----------------------------------------------------
            // Sorteio pertence a outra Pelada
            // ----------------------------------------------------

            if (
                String(
                    peladaSorteioId || ""
                ) !==
                String(
                    this.peladaAtualId
                )
            ) {

                console.log(
                    "🧹 Sorteio anterior pertence a outra Pelada. Limpando..."
                );


                this.limparSorteioSalvo();

                return;

            }


            // ----------------------------------------------------
            // Tentar recuperar sorteio da Pelada atual
            // ----------------------------------------------------

            try {

                const times =
                    JSON.parse(
                        dadosSalvos
                    );


                if (
                    !times ||
                    typeof times !== "object"
                ) {

                    throw new Error(
                        "Formato de sorteio inválido."
                    );

                }


                const amarelo =
                    Array.isArray(
                        times.amarelo
                    )
                        ? times.amarelo
                        : [];


                const vermelho =
                    Array.isArray(
                        times.vermelho
                    )
                        ? times.vermelho
                        : [];


                const azul =
                    Array.isArray(
                        times.azul
                    )
                        ? times.azul
                        : [];


                this.times = {

                    amarelo,

                    vermelho,

                    azul

                };


                this.renderizarTimes();


                this.atualizarStatus(
                    "Sorteio recuperado"
                );


                console.log(
                    "♻️ Sorteio da Pelada atual recuperado.",
                    this.times
                );


            } catch (erro) {

                console.warn(
                    "Não foi possível recuperar o sorteio salvo:",
                    erro
                );


                this.limparSorteioSalvo();

            }

        }


        // ========================================================
        // LIMPAR SORTEIO SALVO
        // ========================================================

        limparSorteioSalvo() {

            localStorage.removeItem(
                "peladaDaFeTimes"
            );


            localStorage.removeItem(
                "peladaDaFeTimesPeladaId"
            );


            localStorage.removeItem(
                "peladaDaFeTimesPeladaNome"
            );


            this.limparTimes();

        }


        // ========================================================
        // EVENTO DE MUDANÇA DE PELADA
        // ========================================================

        detectarMudancaPelada() {

            const idAtual =
                localStorage.getItem(
                    "peladaDaFePeladaAtualId"
                ) ||
                "";


            if (
                String(
                    idAtual
                ) !==
                String(
                    this.peladaAtualId
                )
            ) {

                this.peladaAtualId =
                    String(
                        idAtual
                    );


                this.peladaAtual =
                    null;


                this.peladaValida =
                    false;


                this.limparSorteioSalvo();


                this.atualizarIndicadorPelada();


                this.atualizarBotaoSortear();


                this.carregarPeladaAtual();

            }

        }


        // ========================================================
        // CONFIGURAÇÃO DAS DURAÇÕES
        // ========================================================

        configurarDuracoes() {

            const duracaoPelada =
                document.getElementById(
                    "duracaoPelada"
                );


            const duracaoPartida =
                document.getElementById(
                    "duracaoPartida"
                );


            const containerPelada =
                document.getElementById(
                    "duracaoPeladaPersonalizadaContainer"
                );


            const containerPartida =
                document.getElementById(
                    "duracaoPartidaPersonalizadaContainer"
                );


            const inputPelada =
                document.getElementById(
                    "duracaoPeladaPersonalizada"
                );


            const inputPartida =
                document.getElementById(
                    "duracaoPartidaPersonalizada"
                );


            // ----------------------------------------------------
            // Duração da pelada
            // ----------------------------------------------------

            if (duracaoPelada) {

                duracaoPelada.value =
                    "60";


                duracaoPelada.addEventListener(
                    "change",
                    () => {

                        if (
                            duracaoPelada.value ===
                            "custom"
                        ) {

                            if (containerPelada) {

                                containerPelada.classList.remove(
                                    "d-none"
                                );

                            }

                            if (inputPelada) {

                                inputPelada.focus();

                            }

                            return;

                        }


                        if (containerPelada) {

                            containerPelada.classList.add(
                                "d-none"
                            );

                        }


                        const valor =
                            Number(
                                duracaoPelada.value
                            );


                        if (
                            Number.isFinite(
                                valor
                            ) &&
                            valor > 0
                        ) {

                            this.duracaoPelada =
                                valor;

                        }

                    }
                );

            }


            // ----------------------------------------------------
            // Duração personalizada da pelada
            // ----------------------------------------------------

            if (inputPelada) {

                inputPelada.addEventListener(
                    "input",
                    () => {

                        const valor =
                            Number(
                                inputPelada.value
                            );


                        if (
                            Number.isFinite(
                                valor
                            ) &&
                            valor >= 1 &&
                            valor <= 300
                        ) {

                            this.duracaoPelada =
                                valor;

                        }

                    }
                );

            }


            // ----------------------------------------------------
            // Duração da partida
            // ----------------------------------------------------

            if (duracaoPartida) {

                duracaoPartida.value =
                    "7";


                duracaoPartida.addEventListener(
                    "change",
                    () => {

                        if (
                            duracaoPartida.value ===
                            "custom"
                        ) {

                            if (containerPartida) {

                                containerPartida.classList.remove(
                                    "d-none"
                                );

                            }

                            if (inputPartida) {

                                inputPartida.focus();

                            }

                            return;

                        }


                        if (containerPartida) {

                            containerPartida.classList.add(
                                "d-none"
                            );

                        }


                        const valor =
                            Number(
                                duracaoPartida.value
                            );


                        if (
                            Number.isFinite(
                                valor
                            ) &&
                            valor > 0
                        ) {

                            this.duracaoPartida =
                                valor;

                        }

                    }
                );

            }


            // ----------------------------------------------------
            // Duração personalizada da partida
            // ----------------------------------------------------

            if (inputPartida) {

                inputPartida.addEventListener(
                    "input",
                    () => {

                        const valor =
                            Number(
                                inputPartida.value
                            );


                        if (
                            Number.isFinite(
                                valor
                            ) &&
                            valor >= 1 &&
                            valor <= 60
                        ) {

                            this.duracaoPartida =
                                valor;

                        }

                    }
                );

            }

        }


        // ========================================================
        // OBTER DURAÇÃO DA PELADA
        // ========================================================

        obterDuracaoPelada() {

            const select =
                document.getElementById(
                    "duracaoPelada"
                );


            const input =
                document.getElementById(
                    "duracaoPeladaPersonalizada"
                );


            if (!select) {

                return this.duracaoPelada;

            }


            if (
                select.value ===
                "custom"
            ) {

                const valor =
                    Number(
                        input?.value
                    );


                if (
                    !Number.isFinite(
                        valor
                    ) ||
                    valor < 1 ||
                    valor > 300
                ) {

                    throw new Error(
                        "Informe uma duração válida para a pelada entre 1 e 300 minutos."
                    );

                }


                this.duracaoPelada =
                    valor;


                return valor;

            }


            const valor =
                Number(
                    select.value
                );


            if (
                !Number.isFinite(
                    valor
                ) ||
                valor < 1
            ) {

                throw new Error(
                    "Selecione uma duração válida para a pelada."
                );

            }


            this.duracaoPelada =
                valor;


            return valor;

        }


        // ========================================================
        // OBTER DURAÇÃO DA PARTIDA
        // ========================================================

        obterDuracaoPartida() {

            const select =
                document.getElementById(
                    "duracaoPartida"
                );


            const input =
                document.getElementById(
                    "duracaoPartidaPersonalizada"
                );


            if (!select) {

                return this.duracaoPartida;

            }


            if (
                select.value ===
                "custom"
            ) {

                const valor =
                    Number(
                        input?.value
                    );


                if (
                    !Number.isFinite(
                        valor
                    ) ||
                    valor < 1 ||
                    valor > 60
                ) {

                    throw new Error(
                        "Informe uma duração válida para a partida entre 1 e 60 minutos."
                    );

                }


                this.duracaoPartida =
                    valor;


                return valor;

            }


            const valor =
                Number(
                    select.value
                );


            if (
                !Number.isFinite(
                    valor
                ) ||
                valor < 1
            ) {

                throw new Error(
                    "Selecione uma duração válida para a partida."
                );

            }


            this.duracaoPartida =
                valor;


            return valor;

        }


        // ========================================================
        // CARREGAR JOGADORES
        // ========================================================

        async carregarJogadores() {

            try {

                this.atualizarStatus(
                    "Carregando jogadores..."
                );


                const resposta =
                    await fetch(
                        "/api/jogadores",
                        {
                            cache: "no-store"
                        }
                    );


                if (!resposta.ok) {

                    throw new Error(
                        "Não foi possível carregar os jogadores."
                    );

                }


                const jogadores =
                    await resposta.json();


                // ------------------------------------------------
                // Somente jogadores ativos
                // ------------------------------------------------

                this.jogadores =
                    jogadores.filter(
                        jogador => {

                            return (
                                jogador.status ===
                                "Ativo"
                            );

                        }
                    );


                this.jogadoresFiltrados =
                    [
                        ...this.jogadores
                    ];


                // ------------------------------------------------
                // Atualizar resumo
                // ------------------------------------------------

                this.atualizarResumo();


                // ------------------------------------------------
                // Mostrar jogadores
                // ------------------------------------------------

                this.renderizarJogadores(
                    this.jogadoresFiltrados
                );


                // ------------------------------------------------
                // Status
                // ------------------------------------------------

                if (
                    this.peladaValida
                ) {

                    this.atualizarStatus(
                        "Aguardando sorteio"
                    );

                }


                console.log(
                    "⚽ Jogadores disponíveis:",
                    this.jogadores.length
                );


            } catch (erro) {

                console.error(
                    "Erro ao carregar jogadores:",
                    erro
                );


                this.atualizarStatus(
                    "Erro ao carregar jogadores"
                );


                this.mostrarErro(
                    erro.message
                );

            }

        }


        // ========================================================
        // ATUALIZAR RESUMO
        // ========================================================

        atualizarResumo() {

            const total =
                this.jogadores.length;


            const totalJogadores =
                document.getElementById(
                    "totalJogadoresSorteio"
                );


            const totalAtivos =
                document.getElementById(
                    "totalAtivosSorteio"
                );


            const badge =
                document.getElementById(
                    "badgeJogadoresDisponiveis"
                );


            if (totalJogadores) {

                totalJogadores.textContent =
                    total;

            }


            if (totalAtivos) {

                totalAtivos.textContent =
                    total;

            }


            if (badge) {

                badge.textContent =
                    total;

            }

        }


        // ========================================================
        // PESQUISAR JOGADORES
        // ========================================================

        filtrarJogadores(
            texto
        ) {

            const busca =
                texto
                    .trim()
                    .toLowerCase();


            this.jogadoresFiltrados =
                this.jogadores.filter(
                    jogador => {

                        const nome =
                            (
                                jogador.nome ||
                                ""
                            )
                                .toLowerCase();


                        return nome.includes(
                            busca
                        );

                    }
                );


            this.renderizarJogadores(
                this.jogadoresFiltrados
            );

        }


        // ========================================================
        // RENDERIZAR JOGADORES
        // ========================================================

        renderizarJogadores(
            jogadores
        ) {

            const lista =
                document.getElementById(
                    "listaJogadoresSorteio"
                );


            if (!lista) {

                return;

            }


            if (
                !jogadores.length
            ) {

                lista.innerHTML = `

                    <div
                        class="text-center
                               text-muted
                               py-5"
                    >

                        <i
                            class="bi bi-person-x
                                   fs-1
                                   d-block
                                   mb-3"
                        ></i>

                        <p class="mb-0">

                            Nenhum jogador encontrado.

                        </p>

                    </div>

                `;

                return;

            }


            lista.innerHTML =
                jogadores
                    .map(
                        jogador => {

                            return this.criarCardJogador(
                                jogador
                            );

                        }
                    )
                    .join("");

        }


        // ========================================================
        // CARD DO JOGADOR
        // ========================================================

        criarCardJogador(
            jogador
        ) {

            const nome =
                this.escaparHtml(
                    jogador.nome ||
                    "Sem nome"
                );


            const posicao =
                this.escaparHtml(
                    jogador.posicao ||
                    "Não definida"
                );


            const nivel =
                this.obterNivel(
                    jogador
                );


            const foto =
                jogador.foto ||
                "/assets/img/avatar.png";


            const camisa =
                jogador.numeroCamisa
                    ? `#${this.escaparHtml(
                        jogador.numeroCamisa
                    )}`
                    : "";


            return `

                <div
                    class="border
                           rounded
                           p-2
                           bg-white"
                >

                    <div
                        class="d-flex
                               align-items-center"
                    >

                        <img
                            src="${this.escaparHtml(foto)}"
                            alt="Foto de ${nome}"
                            class="rounded-circle
                                   border
                                   me-2"
                            style="
                                width: 42px;
                                height: 42px;
                                object-fit: cover;
                            "
                            onerror="
                                this.onerror=null;
                                this.src='/assets/img/avatar.png';
                            "
                        >


                        <div class="flex-grow-1">

                            <div class="fw-semibold">

                                ${nome}

                            </div>

                            <small class="text-muted">

                                ${posicao}
                                ${camisa ? ` • ${camisa}` : ""}

                            </small>

                        </div>


                        <div class="text-end">

                            <div
                                class="small
                                       text-muted"
                            >

                                Nível

                            </div>

                            <div>

                                ${this.renderizarEstrelas(
                                    nivel
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }


        // ========================================================
        // OBTER NÍVEL
        // ========================================================

        obterNivel(
            jogador
        ) {

            let nivel =
                Number(
                    jogador.nivel
                );


            if (
                !Number.isFinite(
                    nivel
                )
            ) {

                nivel = 1;

            }


            nivel =
                Math.round(
                    nivel
                );


            if (
                nivel < 1
            ) {

                nivel = 1;

            }


            if (
                nivel > 5
            ) {

                nivel = 5;

            }


            return nivel;

        }


        // ========================================================
        // ESTRELAS
        // ========================================================

        renderizarEstrelas(
            nivel
        ) {

            let estrelas =
                "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                if (
                    i <=
                    nivel
                ) {

                    estrelas += `
                        <i
                            class="bi bi-star-fill
                                   text-warning"
                        ></i>
                    `;

                } else {

                    estrelas += `
                        <i
                            class="bi bi-star
                                   text-muted"
                        ></i>
                    `;

                }

            }


            return estrelas;

        }


        // ========================================================
        // SORTEIO
        // ========================================================

        sortear() {

            // ----------------------------------------------------
            // Validar Pelada atual
            // ----------------------------------------------------

            this.detectarMudancaPelada();


            if (
                !this.peladaValida
            ) {

                this.atualizarStatus(
                    "Pelada não disponível"
                );


                this.mostrarErro(
                    "Selecione uma Pelada válida em Peladas antes de realizar o sorteio."
                );


                return;

            }


            // ----------------------------------------------------
            // Validar configuração
            // ----------------------------------------------------

            let duracaoPelada;

            let duracaoPartida;


            try {

                duracaoPelada =
                    this.obterDuracaoPelada();


                duracaoPartida =
                    this.obterDuracaoPartida();


            } catch (erro) {

                this.mostrarErro(
                    erro.message
                );


                return;

            }


            const total =
                this.jogadores.length;


            // ----------------------------------------------------
            // Validação mínima
            // ----------------------------------------------------

            if (
                total < 3
            ) {

                this.atualizarStatus(
                    "Jogadores insuficientes"
                );


                this.mostrarErro(
                    "É necessário ter pelo menos 3 jogadores ativos para realizar o sorteio."
                );


                return;

            }


            // ----------------------------------------------------
            // Limpar sorteio anterior
            // ----------------------------------------------------

            this.limparTimes();


            // ----------------------------------------------------
            // Criar cópia
            // ----------------------------------------------------

            const jogadores =
                [
                    ...this.jogadores
                ];


            // ----------------------------------------------------
            // Embaralhar
            // ----------------------------------------------------

            this.embaralhar(
                jogadores
            );


            // ----------------------------------------------------
            // Ordenar por nível
            // ----------------------------------------------------

            jogadores.sort(
                (
                    jogadorA,
                    jogadorB
                ) => {

                    return (

                        this.obterNivel(
                            jogadorB
                        ) -

                        this.obterNivel(
                            jogadorA
                        )

                    );

                }
            );


            // ----------------------------------------------------
            // Distribuição equilibrada
            // ----------------------------------------------------

            for (
                const jogador
                of jogadores
            ) {

                const time =
                    this.obterMelhorTime();


                this.times[
                    time
                ].push(
                    jogador
                );

            }


            // ----------------------------------------------------
            // Renderizar
            // ----------------------------------------------------

            this.renderizarTimes();


            // ----------------------------------------------------
            // Salvar sorteio vinculado à Pelada
            // ----------------------------------------------------

            this.salvarSorteioPorPelada(
                duracaoPelada,
                duracaoPartida
            );


            // ----------------------------------------------------
            // Status
            // ----------------------------------------------------

            this.atualizarStatus(
                `Times sorteados • ${this.peladaAtual.nome || "Pelada"}`
            );


            console.log(
                "🎲 Times sorteados:",
                this.times
            );


            console.log(
                "🏆 Pelada do sorteio:",
                this.peladaAtual
            );


            console.log(
                "⏱️ Configuração:",
                {

                    duracaoPelada,

                    duracaoPartida

                }
            );

        }


        // ========================================================
        // SALVAR SORTEIO POR PELADA
        // ========================================================

        salvarSorteioPorPelada(
            duracaoPelada,
            duracaoPartida
        ) {

            if (
                !this.peladaAtualId
            ) {

                return;

            }


            localStorage.setItem(
                "peladaDaFeTimes",
                JSON.stringify(
                    this.times
                )
            );


            localStorage.setItem(
                "peladaDaFeTimesPeladaId",
                String(
                    this.peladaAtualId
                )
            );


            localStorage.setItem(
                "peladaDaFeTimesPeladaNome",
                String(
                    this.peladaAtual?.nome ||
                    "Pelada sem nome"
                )
            );


            // ----------------------------------------------------
            // Guardamos também as durações usadas no sorteio.
            // ----------------------------------------------------

            localStorage.setItem(
                "peladaDaFeDuracaoPelada",
                String(
                    duracaoPelada
                )
            );


            localStorage.setItem(
                "peladaDaFeDuracaoPartida",
                String(
                    duracaoPartida
                )
            );


            console.log(
                "💾 Sorteio salvo para a Pelada:",
                this.peladaAtualId
            );

        }


        // ========================================================
        // EMBARALHAR
        // ========================================================

        embaralhar(
            array
        ) {

            for (
                let i =
                    array.length - 1;

                i > 0;

                i--
            ) {

                const j =
                    Math.floor(
                        Math.random() *
                        (
                            i + 1
                        )
                    );


                [
                    array[i],
                    array[j]
                ] = [
                    array[j],
                    array[i]
                ];

            }


            return array;

        }


        // ========================================================
        // ENCONTRAR O MELHOR TIME
        // ========================================================

        obterMelhorTime() {

            const nomes = [

                "amarelo",

                "vermelho",

                "azul"

            ];


            const informacoes =
                nomes.map(
                    nome => {

                        return {

                            nome,

                            jogadores:
                                this.times[
                                    nome
                                ].length,

                            nivel:
                                this.calcularNivelTime(
                                    this.times[
                                        nome
                                    ]
                                )

                        };

                    }
                );


            const menorQuantidade =
                Math.min(
                    ...informacoes.map(
                        time =>
                            time.jogadores
                    )
                );


            const timesMenorQuantidade =
                informacoes.filter(
                    time => {

                        return (

                            time.jogadores ===
                            menorQuantidade

                        );

                    }
                );


            timesMenorQuantidade.sort(
                (
                    timeA,
                    timeB
                ) => {

                    if (
                        timeA.nivel !==
                        timeB.nivel
                    ) {

                        return (
                            timeA.nivel -
                            timeB.nivel
                        );

                    }


                    return (
                        Math.random() -
                        0.5
                    );

                }
            );


            return (
                timesMenorQuantidade[0].nome
            );

        }


        // ========================================================
        // CALCULAR NÍVEL DO TIME
        // ========================================================

        calcularNivelTime(
            jogadores
        ) {

            return jogadores.reduce(
                (
                    total,
                    jogador
                ) => {

                    return (

                        total +

                        this.obterNivel(
                            jogador
                        )

                    );

                },
                0
            );

        }


        // ========================================================
        // LIMPAR TIMES
        // ========================================================

        limparTimes() {

            this.times = {

                amarelo: [],

                vermelho: [],

                azul: []

            };


            this.atualizarTime(
                "amarelo",
                []
            );


            this.atualizarTime(
                "vermelho",
                []
            );


            this.atualizarTime(
                "azul",
                []
            );

        }


        // ========================================================
        // RENDERIZAR TIMES
        // ========================================================

        renderizarTimes() {

            this.atualizarTime(
                "amarelo",
                this.times.amarelo
            );


            this.atualizarTime(
                "vermelho",
                this.times.vermelho
            );


            this.atualizarTime(
                "azul",
                this.times.azul
            );

        }


        // ========================================================
        // ATUALIZAR UM TIME
        // ========================================================

        atualizarTime(
            nome,
            jogadores
        ) {

            const elemento =
                document.getElementById(
                    `time${this.primeiraLetraMaiuscula(nome)}`
                );


            const quantidade =
                document.getElementById(
                    `quantidade${this.primeiraLetraMaiuscula(nome)}`
                );


            const nivel =
                document.getElementById(
                    `nivel${this.primeiraLetraMaiuscula(nome)}`
                );


            if (!elemento) {

                return;

            }


            if (quantidade) {

                quantidade.textContent =
                    jogadores.length;

            }


            if (nivel) {

                nivel.textContent =
                    this.calcularNivelTime(
                        jogadores
                    );

            }


            if (
                !jogadores.length
            ) {

                elemento.innerHTML = `

                    <div
                        class="text-center
                               text-muted
                               py-5"
                    >

                        <i
                            class="bi bi-shuffle
                                   fs-2
                                   d-block
                                   mb-2"
                        ></i>

                        Aguardando sorteio

                    </div>

                `;

                return;

            }


            elemento.innerHTML =
                jogadores
                    .map(
                        jogador => {

                            return this.criarCardTime(
                                jogador
                            );

                        }
                    )
                    .join("");

        }


        // ========================================================
        // CARD DENTRO DO TIME
        // ========================================================

        criarCardTime(
            jogador
        ) {

            const nome =
                this.escaparHtml(
                    jogador.nome ||
                    "Sem nome"
                );


            const posicao =
                this.escaparHtml(
                    jogador.posicao ||
                    "Não definida"
                );


            const nivel =
                this.obterNivel(
                    jogador
                );


            const foto =
                jogador.foto ||
                "/assets/img/avatar.png";


            return `

                <div
                    class="border
                           rounded
                           p-2
                           bg-light"
                >

                    <div
                        class="d-flex
                               align-items-center"
                    >

                        <img
                            src="${this.escaparHtml(foto)}"
                            alt="Foto de ${nome}"
                            class="rounded-circle
                                   border
                                   me-2"
                            style="
                                width: 38px;
                                height: 38px;
                                object-fit: cover;
                            "
                            onerror="
                                this.onerror=null;
                                this.src='/assets/img/avatar.png';
                            "
                        >


                        <div class="flex-grow-1">

                            <div class="fw-semibold">

                                ${nome}

                            </div>

                            <small class="text-muted">

                                ${posicao}

                            </small>

                        </div>


                        <div
                            class="text-end
                                   small"
                        >

                            <span
                                class="
                                    badge
                                    bg-warning
                                    text-dark
                                "
                            >

                                Nível ${nivel}

                            </span>

                        </div>

                    </div>

                </div>

            `;

        }


        // ========================================================
        // PRIMEIRA LETRA MAIÚSCULA
        // ========================================================

        primeiraLetraMaiuscula(
            valor
        ) {

            return (

                valor.charAt(
                    0
                ).toUpperCase() +

                valor.slice(
                    1
                )

            );

        }


        // ========================================================
        // STATUS
        // ========================================================

        atualizarStatus(
            texto
        ) {

            const elemento =
                document.getElementById(
                    "statusSorteio"
                );


            if (elemento) {

                elemento.textContent =
                    texto;

            }

        }


        // ========================================================
        // ERRO
        // ========================================================

        mostrarErro(
            mensagem
        ) {

            const lista =
                document.getElementById(
                    "listaJogadoresSorteio"
                );


            if (!lista) {

                if (
                    typeof Swal !==
                    "undefined"
                ) {

                    Swal.fire(
                        {

                            icon:
                                "error",

                            title:
                                "Sorteio",

                            text:
                                mensagem ||
                                "Ocorreu um erro."

                        }
                    );

                }

                return;

            }


            lista.innerHTML = `

                <div
                    class="alert alert-danger"
                >

                    <i
                        class="bi bi-exclamation-triangle-fill"
                    ></i>

                    ${this.escaparHtml(
                        mensagem
                    )}

                </div>

            `;

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
                "🧹 Módulo Sorteio destruído."
            );

        }

    }


    // ============================================================
    // INICIAR MÓDULO
    // ============================================================

    if (
        window.Sorteio &&
        typeof window.Sorteio.destroy ===
        "function"
    ) {

        try {

            window.Sorteio.destroy();

        } catch (erro) {

            console.warn(
                "Erro ao destruir Sorteio anterior:",
                erro
            );

        }

    }


    window.Sorteio =
        new Sorteio();

})();