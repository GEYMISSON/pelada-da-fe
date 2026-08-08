const Jogadores = {

    jogadores: [],

    jogadorEditandoId: null,


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

            this.jogadores =
                jogadores || [];

            this.renderizar(
                this.jogadores
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
                (
                    typeof CONFIG !== "undefined"
                        ? CONFIG.DEFAULT_AVATAR
                        : "assets/img/avatar.png"
                );

            const posicao =
                jogador.posicao ||
                "Posição não informada";

            const nivel =
                jogador.nivel ?? 3;

            const gols =
                jogador.gols ?? 0;

            const assistencias =
                jogador.assistencias ?? 0;

            const status =
                jogador.status ||
                "Ativo";


            lista.innerHTML += `

                <div class="col-lg-4 col-md-6 mb-4">

                    <div class="card shadow-sm h-100">

                        <div class="card-body">

                            <div class="d-flex align-items-center mb-3">

                                <img
                                    src="${this.escaparHtml(foto)}"
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

                            <p class="mb-2">
                                ⚽ Gols:
                                <strong>${gols}</strong>
                            </p>

                            <p class="mb-3">
                                🎯 Assistências:
                                <strong>${assistencias}</strong>
                            </p>

                            <div class="d-flex justify-content-between align-items-center">

                                <span class="badge ${
                                    status === "Ativo"
                                        ? "bg-success"
                                        : "bg-secondary"
                                }">

                                    ${this.escaparHtml(status)}

                                </span>


                                <div class="d-flex gap-2">

                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-primary"
                                        onclick="Jogadores.editar('${jogador._id}')"
                                    >

                                        <i class="bi bi-pencil"></i>
                                        Editar

                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-danger"
                                        onclick="Jogadores.excluir('${jogador._id}')"
                                    >

                                        <i class="bi bi-trash"></i>
                                        Excluir

                                    </button>

                                </div>

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

        this.limparFormulario();

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


        this.preencherFormulario(
            jogador
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

    },


    // ==========================
    // PESQUISA
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
            this.jogadores.filter(
                jogador =>
                    (jogador.nome || "")
                        .toLowerCase()
                        .includes(busca)
            );


        this.renderizar(
            filtrados
        );

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

Jogadores.iniciar();