const Jogadores = {

    jogadores: [],


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


        // Novo jogador

        if (btnNovo) {

            btnNovo.addEventListener("click", () => {

                this.limparFormulario();

                this.abrirModal();

            });

        }


        // Salvar jogador

        if (btnSalvar) {

            btnSalvar.addEventListener("click", () => {

                this.salvar();

            });

        }


        // Pesquisa

        if (pesquisa) {

            pesquisa.addEventListener("input", () => {

                this.filtrar(
                    pesquisa.value
                );

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

            this.jogadores = jogadores;

            this.renderizar(jogadores);

        } catch (erro) {

            console.error(
                "Erro ao carregar jogadores:",
                erro
            );

            toast(
                "Erro ao carregar jogadores.",
                "#dc3545"
            );

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


        // Nenhum jogador

        if (!jogadores || jogadores.length === 0) {

            lista.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-secondary">

                        Nenhum jogador cadastrado.

                    </div>

                </div>
            `;

            return;

        }


        // Cards

        jogadores.forEach(jogador => {

            const foto =
                jogador.foto ||
                CONFIG.DEFAULT_AVATAR;

            const posicao =
                jogador.posicao ||
                "Posição não informada";

            const nivel =
                jogador.nivel ?? 3;

            const gols =
                jogador.gols ?? 0;

            lista.innerHTML += `

                <div class="col-lg-4 col-md-6 mb-4">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <div class="d-flex align-items-center mb-3">

                                <img
                                    src="${foto}"
                                    alt="Foto de ${this.escaparHtml(jogador.nome)}"
                                    class="rounded-circle me-3"
                                    style="
                                        width:70px;
                                        height:70px;
                                        object-fit:cover;
                                    "
                                >

                                <div>

                                    <h5 class="mb-1">
                                        ${this.escaparHtml(jogador.nome)}
                                    </h5>

                                    <small class="text-muted">
                                        ${this.escaparHtml(posicao)}
                                    </small>

                                </div>

                            </div>

                            <p class="mb-2">
                                ⭐ Nível:
                                <strong>${nivel}</strong>
                            </p>

                            <p class="mb-0">
                                ⚽ Gols:
                                <strong>${gols}</strong>
                            </p>

                        </div>

                    </div>

                </div>

            `;

        });

    },


    // ==========================
    // FILTRAR
    // ==========================

    filtrar(texto) {

        const busca =
            texto
                .trim()
                .toLowerCase();

        if (!busca) {

            this.renderizar(
                this.jogadores
            );

            return;

        }

        const filtrados =
            this.jogadores.filter(jogador =>
                (jogador.nome || "")
                    .toLowerCase()
                    .includes(busca)
            );

        this.renderizar(filtrados);

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

            toast(
                "Informe o nome do jogador.",
                "#dc3545"
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


        try {

            const btnSalvar =
                document.getElementById(
                    "salvarJogador"
                );

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


            // ==========================
            // API
            // ==========================

            const novoJogador =
                await JogadorService.salvar(
                    jogador
                );


            console.log(
                "Jogador cadastrado:",
                novoJogador
            );


            // ==========================
            // FECHAR MODAL
            // ==========================

            this.fecharModal();


            // ==========================
            // ATUALIZAR LISTA
            // ==========================

            await this.listar();


            // ==========================
            // MENSAGEM
            // ==========================

            sucesso(
                "Jogador cadastrado com sucesso!"
            );


        } catch (erro) {

            console.error(
                "Erro ao salvar jogador:",
                erro
            );

            toast(
                erro.message ||
                "Erro ao cadastrar jogador.",
                "#dc3545"
            );

        } finally {

            const btnSalvar =
                document.getElementById(
                    "salvarJogador"
                );

            if (btnSalvar) {

                btnSalvar.disabled = false;

                btnSalvar.innerHTML = `
                    <i class="bi bi-check-circle-fill"></i>
                    Salvar Jogador
                `;

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

        const foto =
            document.getElementById("foto");

        const previewFoto =
            document.getElementById(
                "previewFoto"
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

        if (foto) {

            foto.value = "";

        }

        if (previewFoto) {

            previewFoto.src =
                CONFIG.DEFAULT_AVATAR;

        }

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

Jogadores.iniciar();