(function () {

const Jogadores = {

    jogadores: [],

    jogadorEditandoId: null,

    // Foto atual/selecionada do jogador.
    // A imagem é convertida para Data URL e armazenada no campo "foto".
    fotoSelecionada: "",


    // ==========================
    // INICIALIZAÇÃO
    // ==========================

    async iniciar() {

        this.configurarEventos();

        await this.listar();

    },


    // ==========================
    // EVENTOS
    // ==========================

    configurarEventos() {

        const btnNovo =
            document.getElementById("btnNovoJogador");

        const btnSalvar =
            document.getElementById("salvarJogador");

        const pesquisa =
            document.getElementById("pesquisaJogador");

        const filtroPosicao =
            document.getElementById("filtroPosicao");

        const filtroStatus =
            document.getElementById("filtroStatus");

        const limparFiltros =
            document.getElementById("limparFiltros");

        const foto =
            document.getElementById("foto");


        // Foto do jogador

        if (foto) {

            foto.addEventListener("change", (evento) => {

                this.selecionarFoto(evento);

            });

        }


        // Novo jogador

        if (btnNovo) {

            btnNovo.addEventListener("click", () => {

                this.novo();

            });

        }


        // Salvar / editar

        if (btnSalvar) {

            btnSalvar.addEventListener("click", () => {

                this.salvar();

            });

        }


        // Pesquisa

        if (pesquisa) {

            pesquisa.addEventListener("input", () => {

                this.aplicarFiltros();

            });

        }


        if (filtroPosicao) {

            filtroPosicao.addEventListener("change", () => {

                this.aplicarFiltros();

            });

        }


        if (filtroStatus) {

            filtroStatus.addEventListener("change", () => {

                this.aplicarFiltros();

            });

        }


        if (limparFiltros) {

            limparFiltros.addEventListener("click", () => {

                this.limparFiltros();

            });

        }

    },


    // ==========================
    // LISTAR
    // ==========================

    async listar() {

        try {

            const jogadores =
                await JogadorService.listar();

            this.jogadores =
                jogadores || [];


            // Atualiza os indicadores
            this.atualizarResumo();


            // Renderiza os jogadores
            this.renderizar(
                this.jogadores
            );

            this.atualizarResultadoFiltro(
                this.jogadores.length
            );

        } catch (erro) {

            console.error(
                "Erro ao carregar jogadores:",
                erro
            );

            this.mostrarErro(
                "Erro ao carregar jogadores."
            );

        }

    },

    // ==========================
    // RESUMO DOS JOGADORES
    // ==========================

    atualizarResumo() {

        const jogadores =
            this.jogadores || [];


        // Total de jogadores

        const total =
            jogadores.length;


        // Jogadores ativos

        const ativos =
            jogadores.filter(
                jogador =>
                    jogador.status === "Ativo"
            ).length;


        // Total de gols

        const gols =
            jogadores.reduce(
                (total, jogador) =>
                    total +
                    Number(jogador.gols || 0),
                0
            );


        // Elementos da tela

        const totalElement =
            document.getElementById(
                "totalJogadores"
            );

        const ativosElement =
            document.getElementById(
                "jogadoresAtivos"
            );

        const golsElement =
            document.getElementById(
                "totalGols"
            );


        // Atualiza tela

        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (ativosElement) {

            ativosElement.textContent =
                ativos;

        }


        if (golsElement) {

            golsElement.textContent =
                gols;

        }

    },


    // ==========================
    // RENDERIZAR
    // ==========================

    renderizar(jogadores) {

    const lista =
        document.getElementById(
            "listaJogadores"
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = "";


    // ==========================
    // NENHUM JOGADOR
    // ==========================

    if (!jogadores || jogadores.length === 0) {

        lista.innerHTML = `
            <div class="col-12">

                <div class="card border-0 shadow-sm">

                    <div class="card-body text-center py-5">

                        <div
                            class="mb-3"
                            style="font-size: 48px;"
                        >
                            ⚽
                        </div>

                        <h5 class="mb-2">
                            Nenhum jogador encontrado
                        </h5>

                        <p class="text-muted mb-0">
                            Cadastre um jogador para começar
                            a montar sua pelada.
                        </p>

                    </div>

                </div>

            </div>
        `;

        return;
    }


    // ==========================
    // CARDS
    // ==========================

    jogadores.forEach(jogador => {

        const foto =
            jogador.foto ||
            (
                typeof CONFIG !== "undefined"
                    ? CONFIG.DEFAULT_AVATAR
                    : "assets/img/avatar.png"
            );


        const nome =
            jogador.nome ||
            "Jogador sem nome";


        const posicao =
            jogador.posicao ||
            "Posição não informada";


        const nivel =
            Number(jogador.nivel ?? 3);


        const gols =
            Number(jogador.gols ?? 0);


        const assistencias =
            Number(jogador.assistencias ?? 0);


        const status =
            jogador.status ||
            "Ativo";


        // ==========================
        // ESTRELAS
        // ==========================

        const estrelasCheias =
            Math.max(
                0,
                Math.min(
                    5,
                    nivel
                )
            );


        const estrelasVazias =
            5 - estrelasCheias;


        const estrelas =
            "⭐".repeat(estrelasCheias) +
            "☆".repeat(estrelasVazias);


        // ==========================
        // STATUS
        // ==========================

        const statusClasse =
            status === "Ativo"
                ? "bg-success"
                : "bg-secondary";


        // ==========================
        // NÚMERO DA CAMISA
        // ==========================

        const numero =
            jogador.numeroCamisa
                ? `#${jogador.numeroCamisa}`
                : "";


        lista.innerHTML += `

            <div class="col-xl-3 col-lg-4 col-md-6 mb-4">

                <div
                    class="card border-0 shadow-sm h-100"
                    style="border-radius: 16px;"
                >

                    <!-- CABEÇALHO -->

                    <div
                        class="card-body text-center pb-2"
                    >

                        <div class="position-relative d-inline-block">

                            <img
                                src="${this.escaparHtml(foto)}"
                                alt="Foto de ${this.escaparHtml(nome)}"
                                class="rounded-circle border shadow-sm"
                                style="
                                    width: 100px;
                                    height: 100px;
                                    object-fit: cover;
                                "
                                onerror="this.onerror=null; this.src='/assets/img/avatar.png';"
                            >

                            ${
                                jogador.numeroCamisa
                                    ? `
                                        <span
                                            class="position-absolute bottom-0 end-0
                                                   badge bg-dark rounded-pill"
                                            style="font-size: 12px;"
                                        >
                                            ${numero}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        <h5 class="fw-bold mt-3 mb-1">

                            ${this.escaparHtml(nome)}

                        </h5>


                        <div class="text-muted small">

                            ${this.escaparHtml(posicao)}

                        </div>

                    </div>


                    <!-- NÍVEL -->

                    <div class="px-3">

                        <div
                            class="bg-light rounded-3 text-center py-2"
                        >

                            <div
                                class="small text-muted mb-1"
                            >
                                Nível
                            </div>

                            <div
                                style="font-size: 17px;"
                            >
                                ${estrelas}
                            </div>

                        </div>

                    </div>


                    <!-- ESTATÍSTICAS -->

                    <div class="card-body">

                        <div class="row text-center">

                            <div class="col-6">

                                <div
                                    class="fw-bold"
                                    style="font-size: 24px;"
                                >
                                    ${gols}
                                </div>

                                <small class="text-muted">
                                    ⚽ Gols
                                </small>

                            </div>


                            <div class="col-6">

                                <div
                                    class="fw-bold"
                                    style="font-size: 24px;"
                                >
                                    ${assistencias}
                                </div>

                                <small class="text-muted">
                                    🎯 Assistências
                                </small>

                            </div>

                        </div>

                    </div>


                    <!-- RODAPÉ -->

                    <div
                        class="card-footer bg-white border-0
                               pt-0 pb-3 px-3"
                    >

                        <div
                            class="d-flex
                                   justify-content-between
                                   align-items-center
                                   mb-3"
                        >

                            <span
                                class="badge ${statusClasse}"
                            >
                                ${this.escaparHtml(status)}
                            </span>


                            <small class="text-muted">
                                ID: ${this.escaparHtml(
                                    String(jogador._id).slice(-6)
                                )}
                            </small>

                        </div>


                        <div class="d-flex gap-2">

                            <button
                                type="button"
                                class="btn btn-outline-primary
                                       btn-sm flex-fill"
                                onclick="Jogadores.editar('${jogador._id}')"
                            >

                                <i class="bi bi-pencil"></i>

                                Editar

                            </button>


                            <button
                                type="button"
                                class="btn btn-outline-danger
                                       btn-sm flex-fill"
                                onclick="Jogadores.excluir('${jogador._id}')"
                            >

                                <i class="bi bi-trash"></i>

                                Excluir

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;

    });

},


    // ==========================
    // NOVO JOGADOR
    // ==========================

    novo() {

        this.jogadorEditandoId = null;

        this.fotoSelecionada = "";

        this.limparFormulario();
        this.atualizarPreviewFoto("");

        this.configurarModalNovo();

        this.abrirModal();

    },


    // ==========================
    // EDITAR JOGADOR
    // ==========================

    editar(id) {

        const jogador =
            this.jogadores.find(
                item => item._id === id
            );


        if (!jogador) {

            this.mostrarErro(
                "Jogador não encontrado."
            );

            return;

        }


        this.jogadorEditandoId =
            jogador._id;

        this.fotoSelecionada =
            jogador.foto || "";

        this.preencherFormulario(
            jogador
        );

        this.atualizarPreviewFoto(
            this.fotoSelecionada
        );


        this.configurarModalEdicao();

        this.abrirModal();

    },


    // ==========================
    // EXCLUIR JOGADOR
    // ==========================

    async excluir(id) {

        const jogador =
            this.jogadores.find(
                item => item._id === id
            );


        if (!jogador) {

            this.mostrarErro(
                "Jogador não encontrado."
            );

            return;

        }


        const nome =
            jogador.nome || "este jogador";


        // ==========================
        // CONFIRMAÇÃO
        // ==========================

        const confirmado =
            await this.confirmarExclusao(
                nome
            );


        if (!confirmado) {

            return;

        }


        try {

            await JogadorService.excluir(
                id
            );


            // Atualiza a lista

            await this.listar();


            this.mostrarSucesso(
                "Jogador excluído com sucesso!"
            );


        } catch (erro) {

            console.error(
                "Erro ao excluir jogador:",
                erro
            );

            this.mostrarErro(
                erro.message ||
                "Erro ao excluir jogador."
            );

        }

    },


    // ==========================
    // CONFIRMAR EXCLUSÃO
    // ==========================

    async confirmarExclusao(nome) {

        // Usa SweetAlert2 se estiver disponível

        if (
            typeof Swal !== "undefined"
        ) {

            const resultado =
                await Swal.fire({

                    title:
                        "Excluir jogador?",

                    text:
                        `Tem certeza que deseja excluir ${nome}?`,

                    icon:
                        "warning",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Sim, excluir",

                    cancelButtonText:
                        "Cancelar",

                    reverseButtons:
                        true

                });


            return resultado.isConfirmed;

        }


        // Fallback para o confirm
        // caso o SweetAlert2 não esteja disponível

        return window.confirm(
            `Tem certeza que deseja excluir ${nome}?`
        );

    },


    // ==========================
    // CONFIGURAR MODAL - NOVO
    // ==========================

    configurarModalNovo() {

        const titulo =
            document.querySelector(
                "#modalJogador .modal-title"
            );

        if (titulo) {

            titulo.innerHTML =
                "👤 Novo Jogador";

        }


        const btnSalvar =
            document.getElementById(
                "salvarJogador"
            );

        if (btnSalvar) {

            btnSalvar.innerHTML =
                "Salvar";

        }

    },


    // ==========================
    // CONFIGURAR MODAL - EDIÇÃO
    // ==========================

    configurarModalEdicao() {

        const titulo =
            document.querySelector(
                "#modalJogador .modal-title"
            );

        if (titulo) {

            titulo.innerHTML =
                "✏️ Editar Jogador";

        }


        const btnSalvar =
            document.getElementById(
                "salvarJogador"
            );

        if (btnSalvar) {

            btnSalvar.innerHTML =
                "Salvar Alterações";

        }

    },


    // ==========================
    // PREENCHER FORMULÁRIO
    // ==========================

    preencherFormulario(jogador) {

        const nome =
            document.getElementById("nome");

        const dataNascimento =
            document.getElementById(
                "dataNascimento"
            );

        const posicao =
            document.getElementById(
                "posicao"
            );

        const numeroCamisa =
            document.getElementById(
                "numeroCamisa"
            );

        const nivel =
            document.getElementById(
                "nivel"
            );

        const gols =
            document.getElementById(
                "gols"
            );

        const assistencias =
            document.getElementById(
                "assistencias"
            );

        const status =
            document.getElementById(
                "status"
            );


        if (nome) {

            nome.value =
                jogador.nome || "";

        }


        if (dataNascimento) {

            dataNascimento.value =
                this.formatarDataParaInput(
                    jogador.dataNascimento
                );

        }


        if (posicao) {

            posicao.value =
                jogador.posicao || "";

        }


        if (numeroCamisa) {

            numeroCamisa.value =
                jogador.numeroCamisa ?? "";

        }


        if (nivel) {

            nivel.value =
                jogador.nivel ?? 3;

        }


        if (gols) {

            gols.value =
                jogador.gols ?? 0;

        }


        if (assistencias) {

            assistencias.value =
                jogador.assistencias ?? 0;

        }


        if (status) {

            status.value =
                jogador.status || "Ativo";

        }

    },


    // ==========================
    // SALVAR
    // ==========================

    async salvar() {

        const nome =
            document.getElementById("nome")
                ?.value
                .trim();

        const dataNascimento =
            document.getElementById(
                "dataNascimento"
            )?.value;

        const posicao =
            document.getElementById(
                "posicao"
            )?.value;

        const numeroCamisa =
            document.getElementById(
                "numeroCamisa"
            )?.value;

        const nivel =
            document.getElementById(
                "nivel"
            )?.value;

        const gols =
            document.getElementById(
                "gols"
            )?.value;

        const assistencias =
            document.getElementById(
                "assistencias"
            )?.value;

        const status =
            document.getElementById(
                "status"
            )?.value;


        // ==========================
        // VALIDAÇÃO
        // ==========================

        if (!nome) {

            this.mostrarErro(
                "Informe o nome do jogador."
            );

            document
                .getElementById("nome")
                ?.focus();

            return;

        }


        // ==========================
        // OBJETO
        // ==========================

        const jogador = {

            nome,

            dataNascimento:
                dataNascimento || undefined,

            posicao:
                posicao || "",

            numeroCamisa:
                numeroCamisa
                    ? Number(numeroCamisa)
                    : null,

            nivel:
                nivel
                    ? Number(nivel)
                    : 3,

            gols:
                gols
                    ? Number(gols)
                    : 0,

            assistencias:
                assistencias
                    ? Number(assistencias)
                    : 0,

            status:
                status || "Ativo"

        };

        // Em uma edição, manter a foto atual se o usuário não escolher outra.
        // Em um novo cadastro, só envia foto quando uma imagem foi selecionada.
        if (this.fotoSelecionada) {

            jogador.foto = this.fotoSelecionada;

        }


        const btnSalvar =
            document.getElementById(
                "salvarJogador"
            );


        try {

            if (btnSalvar) {

                btnSalvar.disabled = true;

                btnSalvar.innerHTML = `
                    <span
                        class="spinner-border spinner-border-sm me-2"
                        role="status">
                    </span>

                    Salvando...
                `;

            }


            let resultado;


            // ==========================
            // EDIÇÃO
            // ==========================

            if (this.jogadorEditandoId) {

                resultado =
                    await JogadorService.editar(
                        this.jogadorEditandoId,
                        jogador
                    );

                console.log(
                    "Jogador atualizado:",
                    resultado
                );


                this.fecharModal();

                await this.listar();

                this.mostrarSucesso(
                    "Jogador atualizado com sucesso!"
                );

            }


            // ==========================
            // NOVO
            // ==========================

            else {

                resultado =
                    await JogadorService.salvar(
                        jogador
                    );

                console.log(
                    "Jogador cadastrado:",
                    resultado
                );


                this.fecharModal();

                await this.listar();

                this.mostrarSucesso(
                    "Jogador cadastrado com sucesso!"
                );

            }


        } catch (erro) {

            console.error(
                "Erro ao salvar jogador:",
                erro
            );

            this.mostrarErro(
                erro.message ||
                "Erro ao salvar jogador."
            );

        } finally {

            if (btnSalvar) {

                btnSalvar.disabled = false;

                btnSalvar.innerHTML =
                    this.jogadorEditandoId
                        ? "Salvar Alterações"
                        : "Salvar";

            }

        }

    },


    // ==========================
    // ABRIR MODAL
    // ==========================

    abrirModal() {

        const elemento =
            document.getElementById(
                "modalJogador"
            );

        if (!elemento) {

            return;

        }

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                elemento
            );

        modal.show();

    },


    // ==========================
    // FECHAR MODAL
    // ==========================

    fecharModal() {

        const elemento =
            document.getElementById(
                "modalJogador"
            );

        if (!elemento) {

            return;

        }

        const modal =
            bootstrap.Modal.getInstance(
                elemento
            );

        if (modal) {

            modal.hide();

        }

    },


    // ==========================
    // LIMPAR FORMULÁRIO
    // ==========================

    limparFormulario() {

        const nome =
            document.getElementById("nome");

        const dataNascimento =
            document.getElementById(
                "dataNascimento"
            );

        const posicao =
            document.getElementById(
                "posicao"
            );

        const numeroCamisa =
            document.getElementById(
                "numeroCamisa"
            );

        const nivel =
            document.getElementById(
                "nivel"
            );

        const gols =
            document.getElementById(
                "gols"
            );

        const assistencias =
            document.getElementById(
                "assistencias"
            );

        const status =
            document.getElementById(
                "status"
            );


        if (nome) {

            nome.value = "";

        }

        if (dataNascimento) {

            dataNascimento.value = "";

        }

        if (posicao) {

            posicao.value = "";

        }

        if (numeroCamisa) {

            numeroCamisa.value = "";

        }

        if (nivel) {

            nivel.value = "3";

        }

        if (gols) {

            gols.value = "0";

        }

        if (assistencias) {

            assistencias.value = "0";

        }

        if (status) {

            status.value = "Ativo";

        }

        const foto =
            document.getElementById("foto");

        if (foto) {

            foto.value = "";

        }

    },

    // ==========================
    // FOTO DO JOGADOR
    // ==========================

    async selecionarFoto(evento) {

        const arquivo =
            evento.target.files?.[0];

        if (!arquivo) {

            return;

        }

        if (!arquivo.type.startsWith("image/")) {

            this.mostrarErro(
                "Selecione um arquivo de imagem válido."
            );

            evento.target.value = "";
            return;

        }

        // Limite de entrada para evitar imagens gigantes no navegador.
        if (arquivo.size > 10 * 1024 * 1024) {

            this.mostrarErro(
                "A foto deve ter no máximo 10 MB."
            );

            evento.target.value = "";
            return;

        }

        try {

            const foto =
                await this.redimensionarFoto(
                    arquivo,
                    900,
                    0.82
                );

            this.fotoSelecionada = foto;

            this.atualizarPreviewFoto(foto);

        } catch (erro) {

            console.error(
                "Erro ao processar foto:",
                erro
            );

            this.mostrarErro(
                "Não foi possível carregar essa foto."
            );

            evento.target.value = "";

        }

    },

    redimensionarFoto(arquivo, tamanhoMaximo = 900, qualidade = 0.82) {

        return new Promise((resolve, reject) => {

            const leitor =
                new FileReader();

            leitor.onload = () => {

                const imagem =
                    new Image();

                imagem.onload = () => {

                    let largura =
                        imagem.naturalWidth;

                    let altura =
                        imagem.naturalHeight;


                    const maiorLado =
                        Math.max(
                            largura,
                            altura
                        );


                    if (maiorLado > tamanhoMaximo) {

                        const escala =
                            tamanhoMaximo /
                            maiorLado;

                        largura =
                            Math.round(
                                largura * escala
                            );

                        altura =
                            Math.round(
                                altura * escala
                            );

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        largura;

                    canvas.height =
                        altura;


                    const contexto =
                        canvas.getContext("2d");

                    if (!contexto) {

                        reject(
                            new Error(
                                "Canvas não disponível."
                            )
                        );

                        return;

                    }


                    contexto.drawImage(
                        imagem,
                        0,
                        0,
                        largura,
                        altura
                    );


                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            qualidade
                        )
                    );

                };


                imagem.onerror = () => {

                    reject(
                        new Error(
                            "Imagem inválida."
                        )
                    );

                };


                imagem.src =
                    leitor.result;

            };


            leitor.onerror = () => {

                reject(
                    leitor.error ||
                    new Error(
                        "Erro ao ler o arquivo."
                    )
                );

            };


            leitor.readAsDataURL(arquivo);

        });

    },

    atualizarPreviewFoto(foto = "") {

        const preview =
            document.getElementById(
                "previewFoto"
            );

        if (!preview) {

            return;

        }

        const padrao =
            typeof CONFIG !== "undefined"
                ? CONFIG.DEFAULT_AVATAR
                : "assets/img/avatar.png";

        preview.src =
            foto ||
            padrao;

        preview.onerror = () => {

            preview.onerror = null;
            preview.src =
                "assets/img/avatar.png";

        };

    },

    // ==========================
    // APLICAR FILTROS
    // ==========================

    aplicarFiltros() {

        const pesquisa =
            document.getElementById(
                "pesquisaJogador"
            )?.value
            .trim()
            .toLowerCase() || "";


        const posicao =
            document.getElementById(
                "filtroPosicao"
            )?.value || "";


        const status =
            document.getElementById(
                "filtroStatus"
            )?.value || "";


        const jogadoresFiltrados =
            this.jogadores.filter(jogador => {


                // ==========================
                // FILTRO POR NOME
                // ==========================

                const nome =
                    (jogador.nome || "")
                        .toLowerCase();


                const correspondeNome =
                    !pesquisa ||
                    nome.includes(pesquisa);


                // ==========================
                // FILTRO POR POSIÇÃO
                // ==========================

                const correspondePosicao =
                    !posicao ||
                    jogador.posicao === posicao;


                // ==========================
                // FILTRO POR STATUS
                // ==========================

                const correspondeStatus =
                    !status ||
                    jogador.status === status;


                return (
                    correspondeNome &&
                    correspondePosicao &&
                    correspondeStatus
                );

            });


        // Renderiza resultado

        this.renderizar(
            jogadoresFiltrados
        );


        // Atualiza contador

        this.atualizarResultadoFiltro(
            jogadoresFiltrados.length
        );

    },


    // ==========================
    // LIMPAR FILTROS
    // ==========================

    limparFiltros() {

        const pesquisa =
            document.getElementById(
                "pesquisaJogador"
            );

        const filtroPosicao =
            document.getElementById(
                "filtroPosicao"
            );

        const filtroStatus =
            document.getElementById(
                "filtroStatus"
            );


        if (pesquisa) {

            pesquisa.value = "";

        }


        if (filtroPosicao) {

            filtroPosicao.value = "";

        }


        if (filtroStatus) {

            filtroStatus.value = "";

        }


        this.renderizar(
            this.jogadores
        );


        this.atualizarResultadoFiltro(
            this.jogadores.length
        );

    },


    // ==========================
    // RESULTADO DOS FILTROS
    // ==========================

    atualizarResultadoFiltro(total) {

        const elemento =
            document.getElementById(
                "resultadoFiltro"
            );


        if (!elemento) {

            return;

        }


        const totalJogadores =
            this.jogadores.length;


        const algumFiltro =
            (
                document.getElementById(
                    "pesquisaJogador"
                )?.value
                .trim()
            ) ||

            (
                document.getElementById(
                    "filtroPosicao"
                )?.value
            ) ||

            (
                document.getElementById(
                    "filtroStatus"
                )?.value
            );


        if (!algumFiltro) {

            elemento.textContent =
                `Todos os jogadores (${totalJogadores})`;

            return;

        }


        elemento.textContent =
            `${total} jogador(es) encontrado(s)`;

    },


    // ==========================
    // DATA PARA INPUT DATE
    // ==========================

    formatarDataParaInput(data) {

        if (!data) {

            return "";

        }


        const dataObj =
            new Date(data);


        if (Number.isNaN(
            dataObj.getTime()
        )) {

            return "";

        }


        const ano =
            dataObj.getFullYear();

        const mes =
            String(
                dataObj.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                dataObj.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;

    },


    // ==========================
    // MENSAGEM DE SUCESSO
    // ==========================

    mostrarSucesso(mensagem) {

        if (
            typeof sucesso === "function"
        ) {

            sucesso(mensagem);

            return;

        }


        if (
            typeof toast === "function"
        ) {

            toast(
                mensagem,
                "#198754"
            );

            return;

        }

        console.log(mensagem);

    },


    // ==========================
    // MENSAGEM DE ERRO
    // ==========================

    mostrarErro(mensagem) {

        if (
            typeof toast === "function"
        ) {

            toast(
                mensagem,
                "#dc3545"
            );

            return;

        }

        console.error(mensagem);

    },


    // ==========================
    // SEGURANÇA HTML
    // ==========================

    escaparHtml(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

};


// ==========================
// INICIALIZAÇÃO
// ==========================

// Os botões Editar/Excluir do HTML usam os handlers inline abaixo.
// Exponha o módulo no window para que eles continuem funcionando após
// a página ser carregada novamente pela SPA.
window.Jogadores = Jogadores;

Jogadores.iniciar();

})();
