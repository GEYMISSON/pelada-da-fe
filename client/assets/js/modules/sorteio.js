(function () {

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

        console.log("⚽ Módulo Sorteio iniciado.");

        this.configurarEventos();

        this.configurarDuracoes();

        await this.carregarJogadores();

    }


    // ========================================================
    // EVENTOS
    // ========================================================

    configurarEventos() {

        const btnSortear =
            document.getElementById("btnSortear");

        const pesquisa =
            document.getElementById("pesquisaSorteio");


        // ----------------------------------------------------
        // Botão sortear
        // ----------------------------------------------------

        if (btnSortear) {

            btnSortear.addEventListener("click", () => {

                this.sortear();

            });

        }


        // ----------------------------------------------------
        // Pesquisa
        // ----------------------------------------------------

        if (pesquisa) {

            pesquisa.addEventListener("input", () => {

                this.filtrarJogadores(
                    pesquisa.value
                );

            });

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

            duracaoPelada.value = "60";


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
                        Number.isFinite(valor) &&
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
                        Number.isFinite(valor) &&
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

            duracaoPartida.value = "7";


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
                        Number.isFinite(valor) &&
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
                        Number.isFinite(valor) &&
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


        if (select.value === "custom") {

            const valor =
                Number(
                    input?.value
                );


            if (
                !Number.isFinite(valor) ||
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
            !Number.isFinite(valor) ||
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


        if (select.value === "custom") {

            const valor =
                Number(
                    input?.value
                );


            if (
                !Number.isFinite(valor) ||
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
            !Number.isFinite(valor) ||
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
                await fetch("/api/jogadores");


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
                jogadores.filter(jogador => {

                    return jogador.status === "Ativo";

                });


            this.jogadoresFiltrados =
                [...this.jogadores];


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


            this.atualizarStatus(
                "Aguardando sorteio"
            );


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

    filtrarJogadores(texto) {

        const busca =
            texto
                .trim()
                .toLowerCase();


        this.jogadoresFiltrados =
            this.jogadores.filter(jogador => {

                const nome =
                    (jogador.nome || "")
                        .toLowerCase();


                return nome.includes(busca);

            });


        this.renderizarJogadores(
            this.jogadoresFiltrados
        );

    }


    // ========================================================
    // RENDERIZAR JOGADORES
    // ========================================================

    renderizarJogadores(jogadores) {

        const lista =
            document.getElementById(
                "listaJogadoresSorteio"
            );


        if (!lista) {

            return;

        }


        // ----------------------------------------------------
        // Nenhum jogador
        // ----------------------------------------------------

        if (!jogadores.length) {

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


        // ----------------------------------------------------
        // Lista
        // ----------------------------------------------------

        lista.innerHTML =
            jogadores
                .map(jogador => {

                    return this.criarCardJogador(
                        jogador
                    );

                })
                .join("");

    }


    // ========================================================
    // CARD DO JOGADOR
    // ========================================================

    criarCardJogador(jogador) {

        const nome =
            this.escaparHtml(
                jogador.nome || "Sem nome"
            );


        const posicao =
            this.escaparHtml(
                jogador.posicao || "Não definida"
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

    obterNivel(jogador) {

        let nivel =
            Number(jogador.nivel);


        if (!Number.isFinite(nivel)) {

            nivel = 1;

        }


        nivel =
            Math.round(nivel);


        if (nivel < 1) {

            nivel = 1;

        }


        if (nivel > 5) {

            nivel = 5;

        }


        return nivel;

    }


    // ========================================================
    // ESTRELAS
    // ========================================================

    renderizarEstrelas(nivel) {

        let estrelas = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            if (i <= nivel) {

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

            alert(
                erro.message
            );

            return;

        }


        const total =
            this.jogadores.length;


        // ----------------------------------------------------
        // Validação mínima
        // ----------------------------------------------------

        if (total < 3) {

            this.atualizarStatus(
                "Jogadores insuficientes"
            );


            alert(
                "É necessário ter pelo menos 3 jogadores ativos para realizar o sorteio."
            );


            return;

        }


        // ----------------------------------------------------
        // Limpar sorteio anterior
        // ----------------------------------------------------

        this.limparTimes();


        // ----------------------------------------------------
        // Criar uma cópia
        // ----------------------------------------------------

        const jogadores =
            [...this.jogadores];


        // ----------------------------------------------------
        // Embaralhar
        // ----------------------------------------------------

        this.embaralhar(jogadores);


        // ----------------------------------------------------
        // Ordenar por nível
        //
        // Mantemos alguma aleatoriedade através do
        // embaralhamento antes da ordenação.
        // ----------------------------------------------------

        jogadores.sort((a, b) => {

            return (
                this.obterNivel(b) -
                this.obterNivel(a)
            );

        });


        // ----------------------------------------------------
        // Distribuição equilibrada
        // ----------------------------------------------------

        for (const jogador of jogadores) {

            const time =
                this.obterMelhorTime();


            this.times[time].push(
                jogador
            );

        }


        // ----------------------------------------------------
        // Renderizar
        // ----------------------------------------------------

        this.renderizarTimes();

        // ----------------------------------------------------
        // Salvar sorteio para a tela de Partidas
        // ----------------------------------------------------

        localStorage.setItem(
            "peladaDaFeTimes",
            JSON.stringify(this.times)
        );


        // ----------------------------------------------------
        // Atualizar status
        // ----------------------------------------------------

        this.atualizarStatus(
            `Times sorteados • Pelada: ${duracaoPelada} min • Partida: ${duracaoPartida} min`
        );


        console.log(
            "🎲 Times sorteados:",
            this.times
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
    // EMBARALHAR
    // ========================================================

    embaralhar(array) {

        for (
            let i = array.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
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


        // ----------------------------------------------------
        // Calcula informações dos times
        // ----------------------------------------------------

        const informacoes =
            nomes.map(nome => {

                return {

                    nome,

                    jogadores:
                        this.times[nome].length,

                    nivel:
                        this.calcularNivelTime(
                            this.times[nome]
                        )

                };

            });


        // ----------------------------------------------------
        // Primeiro: quantidade de jogadores
        //
        // Nunca deixamos um time ficar com mais de um jogador
        // de diferença em relação aos demais.
        // ----------------------------------------------------

        const menorQuantidade =
            Math.min(
                ...informacoes.map(
                    time => time.jogadores
                )
            );


        const timesMenorQuantidade =
            informacoes.filter(time => {

                return (
                    time.jogadores ===
                    menorQuantidade
                );

            });


        // ----------------------------------------------------
        // Se houver empate na quantidade,
        // escolhemos o time com menor nível total.
        // ----------------------------------------------------

        timesMenorQuantidade.sort((a, b) => {

            if (a.nivel !== b.nivel) {

                return a.nivel - b.nivel;

            }


            // Pequena aleatoriedade quando tudo empata

            return Math.random() - 0.5;

        });


        return timesMenorQuantidade[0].nome;

    }


    // ========================================================
    // CALCULAR NÍVEL DO TIME
    // ========================================================

    calcularNivelTime(jogadores) {

        return jogadores.reduce(
            (total, jogador) => {

                return (
                    total +
                    this.obterNivel(jogador)
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

    atualizarTime(nome, jogadores) {

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


        // ----------------------------------------------------
        // Quantidade
        // ----------------------------------------------------

        if (quantidade) {

            quantidade.textContent =
                jogadores.length;

        }


        // ----------------------------------------------------
        // Nível total
        // ----------------------------------------------------

        if (nivel) {

            nivel.textContent =
                this.calcularNivelTime(
                    jogadores
                );

        }


        // ----------------------------------------------------
        // Sem jogadores
        // ----------------------------------------------------

        if (!jogadores.length) {

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


        // ----------------------------------------------------
        // Jogadores do time
        // ----------------------------------------------------

        elemento.innerHTML =
            jogadores
                .map(jogador => {

                    return this.criarCardTime(
                        jogador
                    );

                })
                .join("");

    }


    // ========================================================
    // CARD DENTRO DO TIME
    // ========================================================

    criarCardTime(jogador) {

        const nome =
            this.escaparHtml(
                jogador.nome || "Sem nome"
            );


        const posicao =
            this.escaparHtml(
                jogador.posicao || "Não definida"
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
                            class="badge bg-warning
                                   text-dark"
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

    primeiraLetraMaiuscula(valor) {

        return (
            valor.charAt(0).toUpperCase() +
            valor.slice(1)
        );

    }


    // ========================================================
    // STATUS
    // ========================================================

    atualizarStatus(texto) {

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

    mostrarErro(mensagem) {

        const lista =
            document.getElementById(
                "listaJogadoresSorteio"
            );


        if (!lista) {

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

    escaparHtml(valor) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            valor ?? "";


        return div.innerHTML;

    }

}


// ============================================================
// INICIAR MÓDULO
// ============================================================

new Sorteio();

})();