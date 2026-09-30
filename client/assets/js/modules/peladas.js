(function () {

    // ============================================================
    // PELADA DA FÉ
    // MÓDULO: CADASTRO DE PELADAS
    // ============================================================

    class Peladas {

        constructor() {

            this.peladas = [];

            this.peladasFiltradas = [];

            this.modalPelada = null;

            this.modalDetalhes = null;

            // ID da pelada atualmente selecionada
            this.peladaAtualId =
                localStorage.getItem(
                    "peladaDaFePeladaAtualId"
                ) || "";

            this.inicializar();

        }


        // ========================================================
        // INICIALIZAR
        // ========================================================

        inicializar() {

            console.log(
                "📅 Módulo Peladas iniciado."
            );


            this.inicializarModais();

            this.configurarEventos();

            this.definirDataPadrao();

            this.carregarPeladas();

        }


        // ========================================================
        // MODAIS
        // ========================================================

        inicializarModais() {

            const elementoModal =
                document.getElementById(
                    "modalPelada"
                );


            const elementoDetalhes =
                document.getElementById(
                    "modalDetalhesPelada"
                );


            if (
                elementoModal &&
                typeof bootstrap !== "undefined"
            ) {

                this.modalPelada =
                    new bootstrap.Modal(
                        elementoModal
                    );

            }


            if (
                elementoDetalhes &&
                typeof bootstrap !== "undefined"
            ) {

                this.modalDetalhes =
                    new bootstrap.Modal(
                        elementoDetalhes
                    );

            }

        }


        // ========================================================
        // EVENTOS
        // ========================================================

        configurarEventos() {

            const btnNova =
                document.getElementById(
                    "btnNovaPelada"
                );


            const btnSalvar =
                document.getElementById(
                    "btnSalvarPelada"
                );


            const pesquisa =
                document.getElementById(
                    "pesquisaPelada"
                );


            const filtroStatus =
                document.getElementById(
                    "filtroStatusPelada"
                );


            const filtroData =
                document.getElementById(
                    "filtroDataPelada"
                );


            const btnLimpar =
                document.getElementById(
                    "btnLimparFiltrosPelada"
                );


            if (btnNova) {

                btnNova.addEventListener(
                    "click",
                    () => {

                        this.abrirNovo();

                    }
                );

            }


            if (btnSalvar) {

                btnSalvar.addEventListener(
                    "click",
                    () => {

                        this.salvar();

                    }
                );

            }


            if (pesquisa) {

                pesquisa.addEventListener(
                    "input",
                    () => {

                        this.aplicarFiltros();

                    }
                );

            }


            if (filtroStatus) {

                filtroStatus.addEventListener(
                    "change",
                    () => {

                        this.aplicarFiltros();

                    }
                );

            }


            if (filtroData) {

                filtroData.addEventListener(
                    "change",
                    () => {

                        this.aplicarFiltros();

                    }
                );

            }


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
                    "listaPeladas"
                );


            if (lista) {

                lista.addEventListener(
                    "click",
                    evento => {

                        const botao =
                            evento.target.closest(
                                "[data-acao]"
                            );


                        if (!botao) {

                            return;

                        }


                        const acao =
                            botao.dataset.acao;


                        const id =
                            botao.dataset.id;


                        if (
                            !acao ||
                            !id
                        ) {

                            return;

                        }


                        if (
                            acao ===
                            "editar"
                        ) {

                            this.editar(
                                id
                            );

                        }


                        if (
                            acao ===
                            "excluir"
                        ) {

                            this.excluir(
                                id
                            );

                        }


                        if (
                            acao ===
                            "detalhes"
                        ) {

                            this.detalhes(
                                id
                            );

                        }


                        if (
                            acao ===
                            "selecionar"
                        ) {

                            this.selecionarPeladaAtual(
                                id
                            );

                        }

                    }
                );

            }

        }


        // ========================================================
        // DATA PADRÃO
        // ========================================================

        definirDataPadrao() {

            const campo =
                document.getElementById(
                    "dataPelada"
                );


            if (!campo) {

                return;

            }


            const agora =
                new Date();


            const ano =
                agora.getFullYear();


            const mes =
                String(
                    agora.getMonth() + 1
                )
                    .padStart(
                        2,
                        "0"
                    );


            const dia =
                String(
                    agora.getDate()
                )
                    .padStart(
                        2,
                        "0"
                    );


            campo.value =
                `${ano}-${mes}-${dia}`;

        }


        // ========================================================
        // CARREGAR PELADAS
        // ========================================================

        async carregarPeladas() {

            this.mostrarStatus(
                "Carregando peladas...",
                "info"
            );


            try {

                const resposta =
                    await fetch(
                        "/api/peladas",
                        {
                            cache: "no-store"
                        }
                    );


                const dados =
                    await this.lerResposta(
                        resposta
                    );


                if (!resposta.ok) {

                    throw new Error(
                        dados?.erro ||
                        "Não foi possível carregar as peladas."
                    );

                }


                this.peladas =
                    Array.isArray(
                        dados
                    )
                        ? dados
                        : [];


                this.validarPeladaAtual();


                this.peladasFiltradas =
                    [
                        ...this.peladas
                    ];


                this.atualizarResumo();

                this.renderizar();

                this.ocultarStatus();


                console.log(
                    "✅ Peladas carregadas:",
                    this.peladas.length
                );


                const peladaAtual =
                    this.obterPeladaAtual();


                if (peladaAtual) {

                    console.log(
                        "🏆 Pelada atual:",
                        peladaAtual
                    );

                }

            } catch (erro) {

                console.error(
                    "Erro ao carregar peladas:",
                    erro
                );


                this.mostrarStatus(
                    erro.message,
                    "danger"
                );


                this.renderizarVazio(
                    "Não foi possível carregar as peladas."
                );

            }

        }


        // ========================================================
        // NOVA PELADA
        // ========================================================

        abrirNovo() {

            const formulario =
                document.getElementById(
                    "formPelada"
                );


            if (formulario) {

                formulario.reset();

            }


            const id =
                document.getElementById(
                    "peladaId"
                );


            const nome =
                document.getElementById(
                    "nomePelada"
                );


            const status =
                document.getElementById(
                    "statusPelada"
                );


            const quantidade =
                document.getElementById(
                    "quantidadeTimes"
                );


            const duracao =
                document.getElementById(
                    "duracaoMinutos"
                );


            const titulo =
                document.getElementById(
                    "tituloModalPelada"
                );


            if (id) {

                id.value =
                    "";

            }


            if (nome) {

                nome.value =
                    "Pelada da Fé";

            }


            if (status) {

                status.value =
                    "Agendada";

            }


            if (quantidade) {

                quantidade.value =
                    3;

            }


            if (duracao) {

                duracao.value =
                    60;

            }


            this.definirDataPadrao();


            const horario =
                document.getElementById(
                    "horarioPelada"
                );


            if (horario) {

                horario.value =
                    "19:30";

            }


            if (titulo) {

                titulo.textContent =
                    "Nova Pelada";

            }


            this.abrirModal(
                this.modalPelada
            );

        }


        // ========================================================
        // EDITAR
        // ========================================================

        editar(id) {

            const pelada =
                this.peladas.find(
                    item =>
                        this.obterId(
                            item
                        ) === id
                );


            if (!pelada) {

                return;

            }


            const campoId =
                document.getElementById(
                    "peladaId"
                );


            const nome =
                document.getElementById(
                    "nomePelada"
                );


            const data =
                document.getElementById(
                    "dataPelada"
                );


            const horario =
                document.getElementById(
                    "horarioPelada"
                );


            const local =
                document.getElementById(
                    "localPelada"
                );


            const descricao =
                document.getElementById(
                    "descricaoPelada"
                );


            const observacoes =
                document.getElementById(
                    "observacoesPelada"
                );


            const quantidade =
                document.getElementById(
                    "quantidadeTimes"
                );


            const duracao =
                document.getElementById(
                    "duracaoMinutos"
                );


            const status =
                document.getElementById(
                    "statusPelada"
                );


            const titulo =
                document.getElementById(
                    "tituloModalPelada"
                );


            if (campoId) {

                campoId.value =
                    id;

            }


            if (nome) {

                nome.value =
                    pelada.nome ||
                    "Pelada da Fé";

            }


            if (data) {

                data.value =
                    this.formatarDataInput(
                        pelada.data
                    );

            }


            if (horario) {

                horario.value =
                    pelada.horario ||
                    "";

            }


            if (local) {

                local.value =
                    pelada.local ||
                    "";

            }


            if (descricao) {

                descricao.value =
                    pelada.descricao ||
                    "";

            }


            if (observacoes) {

                observacoes.value =
                    pelada.observacoes ||
                    "";

            }


            if (quantidade) {

                quantidade.value =
                    pelada.quantidadeTimes ??
                    3;

            }


            if (duracao) {

                duracao.value =
                    pelada.duracaoMinutos ??
                    60;

            }


            if (status) {

                status.value =
                    pelada.status ||
                    "Agendada";

            }


            if (titulo) {

                titulo.textContent =
                    "Editar Pelada";

            }


            this.abrirModal(
                this.modalPelada
            );

        }


        // ========================================================
        // SALVAR
        // ========================================================

        async salvar() {

            const id =
                document.getElementById(
                    "peladaId"
                )?.value
                .trim();


            const dados = {

                nome:
                    document.getElementById(
                        "nomePelada"
                    )?.value
                    .trim(),

                data:
                    document.getElementById(
                        "dataPelada"
                    )?.value,

                horario:
                    document.getElementById(
                        "horarioPelada"
                    )?.value,

                local:
                    document.getElementById(
                        "localPelada"
                    )?.value
                    .trim(),

                descricao:
                    document.getElementById(
                        "descricaoPelada"
                    )?.value
                    .trim(),

                observacoes:
                    document.getElementById(
                        "observacoesPelada"
                    )?.value
                    .trim(),

                quantidadeTimes:
                    Number(
                        document.getElementById(
                            "quantidadeTimes"
                        )?.value
                    ),

                duracaoMinutos:
                    Number(
                        document.getElementById(
                            "duracaoMinutos"
                        )?.value
                    ),

                status:
                    document.getElementById(
                        "statusPelada"
                    )?.value

            };


            if (
                !dados.data ||
                !dados.horario
            ) {

                this.mostrarAlerta(
                    "Informe a data e o horário da pelada.",
                    "warning"
                );

                return;

            }


            if (
                !Number.isInteger(
                    dados.quantidadeTimes
                ) ||
                dados.quantidadeTimes < 2 ||
                dados.quantidadeTimes > 10
            ) {

                this.mostrarAlerta(
                    "A quantidade de times deve estar entre 2 e 10.",
                    "warning"
                );

                return;

            }


            if (
                !Number.isInteger(
                    dados.duracaoMinutos
                ) ||
                dados.duracaoMinutos < 1 ||
                dados.duracaoMinutos > 720
            ) {

                this.mostrarAlerta(
                    "A duração deve estar entre 1 e 720 minutos.",
                    "warning"
                );

                return;

            }


            const botao =
                document.getElementById(
                    "btnSalvarPelada"
                );


            this.alterarEstadoBotaoSalvar(
                botao,
                true
            );


            try {

                const resposta =
                    await fetch(
                        id
                            ? `/api/peladas/${id}`
                            : "/api/peladas",
                        {

                            method:
                                id
                                    ? "PUT"
                                    : "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    dados
                                )

                        }
                    );


                const resultado =
                    await this.lerResposta(
                        resposta
                    );


                if (!resposta.ok) {

                    throw new Error(
                        resultado?.erro ||
                        "Não foi possível salvar a pelada."
                    );

                }


                this.fecharModal(
                    this.modalPelada
                );


                this.mostrarAlerta(
                    id
                        ? "Pelada atualizada com sucesso."
                        : "Pelada criada com sucesso.",
                    "success"
                );


                await this.carregarPeladas();

                // Caso a pelada editada seja a atual,
                // atualizamos também o snapshot salvo.
                if (
                    id &&
                    id === this.peladaAtualId
                ) {

                    this.salvarPeladaAtual(
                        this.peladas.find(
                            item =>
                                this.obterId(item) === id
                        )
                    );

                }

            } catch (erro) {

                console.error(
                    "Erro ao salvar pelada:",
                    erro
                );


                this.mostrarAlerta(
                    erro.message,
                    "error"
                );

            } finally {

                this.alterarEstadoBotaoSalvar(
                    botao,
                    false
                );

            }

        }


        // ========================================================
        // SELECIONAR PELADA ATUAL
        // ========================================================

        selecionarPeladaAtual(id) {

            const pelada =
                this.peladas.find(
                    item =>
                        this.obterId(item) === id
                );


            if (!pelada) {

                this.mostrarAlerta(
                    "Pelada não encontrada.",
                    "warning"
                );

                return;

            }


            const statusBloqueado =
                pelada.status ===
                    "Finalizada" ||
                pelada.status ===
                    "Cancelada";


            if (statusBloqueado) {

                this.mostrarAlerta(
                    "Esta pelada está finalizada ou cancelada e não será selecionada como pelada atual.",
                    "warning"
                );

                return;

            }


            this.peladaAtualId =
                id;


            this.salvarPeladaAtual(
                pelada
            );


            this.renderizar();


            this.mostrarAlerta(
                `A pelada "${pelada.nome || "Pelada da Fé"}" foi definida como atual.`,
                "success"
            );


            console.log(
                "🏆 Pelada atual selecionada:",
                pelada
            );

        }


        // ========================================================
        // SALVAR PELADA ATUAL NO LOCALSTORAGE
        // ========================================================

        salvarPeladaAtual(
            pelada
        ) {

            if (!pelada) {

                return;

            }


            const id =
                this.obterId(
                    pelada
                );


            if (!id) {

                return;

            }


            const dados = {

                id:

                    id,

                nome:

                    pelada.nome ||
                    "Pelada da Fé",

                data:

                    pelada.data ||
                    null,

                horario:

                    pelada.horario ||
                    "",

                local:

                    pelada.local ||
                    "",

                status:

                    pelada.status ||
                    "Agendada"

            };


            localStorage.setItem(
                "peladaDaFePeladaAtualId",
                id
            );


            localStorage.setItem(
                "peladaDaFePeladaAtual",
                JSON.stringify(
                    dados
                )
            );

        }


        // ========================================================
        // OBTER PELADA ATUAL
        // ========================================================

        obterPeladaAtual() {

            if (!this.peladaAtualId) {

                return null;

            }


            return (
                this.peladas.find(
                    item =>
                        this.obterId(item) ===
                        this.peladaAtualId
                ) ||
                null
            );

        }


        // ========================================================
        // VALIDAR PELADA ATUAL
        // ========================================================

        validarPeladaAtual() {

            if (
                !this.peladaAtualId
            ) {

                return;

            }


            const pelada =
                this.peladas.find(
                    item =>
                        this.obterId(item) ===
                        this.peladaAtualId
                );


            if (!pelada) {

                this.limparPeladaAtual();

                return;

            }


            if (
                pelada.status ===
                    "Finalizada" ||
                pelada.status ===
                    "Cancelada"
            ) {

                this.limparPeladaAtual();

                return;

            }


            this.salvarPeladaAtual(
                pelada
            );

        }


        // ========================================================
        // LIMPAR PELADA ATUAL
        // ========================================================

        limparPeladaAtual(
            mostrarMensagem = true
        ) {

            const pelada =
                this.obterPeladaAtual();


            this.peladaAtualId =
                "";


            localStorage.removeItem(
                "peladaDaFePeladaAtualId"
            );


            localStorage.removeItem(
                "peladaDaFePeladaAtual"
            );


            this.renderizar();


            if (
                mostrarMensagem &&
                pelada
            ) {

                this.mostrarAlerta(
                    "A pelada atual foi desmarcada.",
                    "success"
                );

            }

        }


        // ========================================================
        // EXCLUIR
        // ========================================================

        async excluir(id) {

            const pelada =
                this.peladas.find(
                    item =>
                        this.obterId(
                            item
                        ) === id
                );


            if (!pelada) {

                return;

            }


            const confirmar =
                await this.confirmarExclusao(
                    pelada.nome ||
                    "esta pelada"
                );


            if (!confirmar) {

                return;

            }


            try {

                const resposta =
                    await fetch(
                        `/api/peladas/${id}`,
                        {
                            method:
                                "DELETE"
                        }
                    );


                const resultado =
                    await this.lerResposta(
                        resposta
                    );


                if (!resposta.ok) {

                    throw new Error(

                        resultado?.detalhes
                            ? `${resultado.erro} ${resultado.detalhes}`
                            : (
                                resultado?.erro ||
                                "Não foi possível excluir a pelada."
                            )

                    );

                }


                // Caso a pelada excluída fosse a atual,
                // limpamos a seleção.
                if (
                    id ===
                    this.peladaAtualId
                ) {

                    this.limparPeladaAtual(
                        false
                    );

                }


                this.mostrarAlerta(
                    "Pelada excluída com sucesso.",
                    "success"
                );


                await this.carregarPeladas();

            } catch (erro) {

                console.error(
                    "Erro ao excluir pelada:",
                    erro
                );


                this.mostrarAlerta(
                    erro.message,
                    "error"
                );

            }

        }


        // ========================================================
        // DETALHES
        // ========================================================

        detalhes(id) {

            const pelada =
                this.peladas.find(
                    item =>
                        this.obterId(
                            item
                        ) === id
                );


            if (!pelada) {

                return;

            }


            const area =
                document.getElementById(
                    "detalhesPelada"
                );


            if (!area) {

                return;

            }


            const totalPartidas =
                Number(
                    pelada.totalPartidas ||
                    0
                );


            const isAtual =
                this.obterId(
                    pelada
                ) ===
                this.peladaAtualId;


            area.innerHTML = `

                <div class="row g-3">

                    <div class="col-md-8">

                        <div
                            class="card
                                   border-0
                                   bg-light
                                   h-100"
                        >

                            <div class="card-body">

                                <div
                                    class="d-flex
                                           justify-content-between
                                           align-items-start
                                           gap-2"
                                >

                                    <div>

                                        <small
                                            class="text-muted"
                                        >
                                            Pelada
                                        </small>

                                        <h4
                                            class="fw-bold mb-1"
                                        >
                                            ${this.escaparHtml(
                                                pelada.nome ||
                                                "Pelada da Fé"
                                            )}
                                        </h4>

                                    </div>

                                    ${
                                        isAtual
                                            ? `
                                                <span
                                                    class="badge bg-success"
                                                >
                                                    <i class="bi bi-check-circle me-1"></i>
                                                    Pelada atual
                                                </span>
                                              `
                                            : ""
                                    }

                                </div>


                                <div
                                    class="row g-3 mt-2"
                                >

                                    <div class="col-sm-6">

                                        <small
                                            class="text-muted d-block"
                                        >
                                            Data
                                        </small>

                                        <strong>
                                            ${this.formatarData(
                                                pelada.data
                                            )}
                                        </strong>

                                    </div>


                                    <div class="col-sm-6">

                                        <small
                                            class="text-muted d-block"
                                        >
                                            Horário
                                        </small>

                                        <strong>
                                            ${this.escaparHtml(
                                                pelada.horario ||
                                                "--"
                                            )}
                                        </strong>

                                    </div>


                                    <div class="col-sm-6">

                                        <small
                                            class="text-muted d-block"
                                        >
                                            Local
                                        </small>

                                        <strong>
                                            ${this.escaparHtml(
                                                pelada.local ||
                                                "--"
                                            )}
                                        </strong>

                                    </div>


                                    <div class="col-sm-6">

                                        <small
                                            class="text-muted d-block"
                                        >
                                            Duração
                                        </small>

                                        <strong>
                                            ${pelada.duracaoMinutos || 0}
                                            minutos
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="col-md-4">

                        <div
                            class="card
                                   border-0
                                   bg-primary
                                   text-white
                                   h-100"
                        >

                            <div
                                class="card-body
                                       d-flex
                                       flex-column
                                       justify-content-center
                                       text-center"
                            >

                                <small>
                                    Partidas
                                </small>

                                <div
                                    class="display-4
                                           fw-bold"
                                >
                                    ${totalPartidas}
                                </div>

                                <small>
                                    realizadas
                                </small>

                            </div>

                        </div>

                    </div>


                    <div class="col-12">

                        <div class="card border-0">

                            <div class="card-body px-0">

                                <h6
                                    class="fw-bold"
                                >
                                    Descrição
                                </h6>

                                <p
                                    class="text-muted"
                                >
                                    ${this.escaparHtml(
                                        pelada.descricao ||
                                        "Nenhuma descrição informada."
                                    )}
                                </p>


                                <h6
                                    class="fw-bold"
                                >
                                    Observações
                                </h6>

                                <p
                                    class="text-muted mb-0"
                                >
                                    ${this.escaparHtml(
                                        pelada.observacoes ||
                                        "Nenhuma observação informada."
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            `;


            this.abrirModal(
                this.modalDetalhes
            );

        }


        // ========================================================
        // FILTROS
        // ========================================================

        aplicarFiltros() {

            const pesquisa =
                document.getElementById(
                    "pesquisaPelada"
                )?.value
                .trim()
                .toLowerCase();


            const status =
                document.getElementById(
                    "filtroStatusPelada"
                )?.value;


            const data =
                document.getElementById(
                    "filtroDataPelada"
                )?.value;


            this.peladasFiltradas =
                this.peladas.filter(
                    pelada => {

                        const texto = [

                            pelada.nome,

                            pelada.local,

                            pelada.descricao,

                            pelada.observacoes

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        if (
                            pesquisa &&
                            !texto.includes(
                                pesquisa
                            )
                        ) {

                            return false;

                        }


                        if (
                            status &&
                            pelada.status !==
                            status
                        ) {

                            return false;

                        }


                        if (
                            data &&
                            this.formatarDataInput(
                                pelada.data
                            ) !==
                            data
                        ) {

                            return false;

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

            const pesquisa =
                document.getElementById(
                    "pesquisaPelada"
                );


            const status =
                document.getElementById(
                    "filtroStatusPelada"
                );


            const data =
                document.getElementById(
                    "filtroDataPelada"
                );


            if (pesquisa) {

                pesquisa.value =
                    "";

            }


            if (status) {

                status.value =
                    "";

            }


            if (data) {

                data.value =
                    "";

            }


            this.peladasFiltradas =
                [
                    ...this.peladas
                ];


            this.renderizar();

        }


        // ========================================================
        // RENDERIZAR
        // ========================================================

        renderizar() {

            const lista =
                document.getElementById(
                    "listaPeladas"
                );


            if (!lista) {

                return;

            }


            if (
                !this.peladasFiltradas.length
            ) {

                this.renderizarVazio(
                    "Nenhuma pelada encontrada."
                );

                return;

            }


            lista.innerHTML =
                this.peladasFiltradas
                    .map(
                        pelada =>
                            this.renderizarLinha(
                                pelada
                            )
                    )
                    .join("");


            const badge =
                document.getElementById(
                    "badgePeladas"
                );


            if (badge) {

                badge.textContent =
                    this.peladasFiltradas.length;

            }


            this.atualizarIndicadorPeladaAtual();

        }


        // ========================================================
        // RENDERIZAR LINHA
        // ========================================================

        renderizarLinha(
            pelada
        ) {

            const id =
                this.escaparAtributo(
                    this.obterId(
                        pelada
                    )
                );


            const status =
                this.obterClasseStatus(
                    pelada.status
                );


            const textoStatus =
                pelada.status ||
                "Agendada";


            const isAtual =
                this.obterId(
                    pelada
                ) ===
                this.peladaAtualId;


            const podeSelecionar =
                pelada.status !==
                    "Finalizada" &&
                pelada.status !==
                    "Cancelada";


            return `

                <tr
                    class="${
                        isAtual
                            ? "table-success"
                            : ""
                    }"
                >


                    <td
                        class="text-nowrap"
                    >

                        <strong>
                            ${this.formatarData(
                                pelada.data
                            )}
                        </strong>

                    </td>


                    <td>

                        <div
                            class="fw-bold
                                   d-flex
                                   align-items-center
                                   gap-2"
                        >

                            ${
                                isAtual
                                    ? `
                                        <i
                                            class="bi bi-check-circle-fill text-success"
                                            title="Pelada atual"
                                        ></i>
                                      `
                                    : ""
                            }

                            <span>
                                ${this.escaparHtml(
                                    pelada.nome ||
                                    "Pelada da Fé"
                                )}
                            </span>

                        </div>

                        ${
                            pelada.descricao
                                ? `
                                    <small
                                        class="text-muted"
                                    >
                                        ${this.escaparHtml(
                                            pelada.descricao
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                    </td>


                    <td
                        class="text-nowrap"
                    >

                        ${this.escaparHtml(
                            pelada.horario ||
                            "--"
                        )}

                    </td>


                    <td>

                        ${this.escaparHtml(
                            pelada.local ||
                            "--"
                        )}

                    </td>


                    <td>

                        <span
                            class="badge bg-dark"
                        >
                            ${pelada.quantidadeTimes || 0}
                        </span>

                    </td>


                    <td>

                        <span
                            class="badge bg-primary"
                        >
                            ${pelada.totalPartidas || 0}
                        </span>

                    </td>


                    <td>

                        <span
                            class="badge ${status}"
                        >
                            ${this.escaparHtml(
                                textoStatus
                            )}
                        </span>

                    </td>


                    <td>

                        <div
                            class="d-flex
                                   justify-content-end
                                   gap-1
                                   flex-wrap"
                        >

                            ${
                                isAtual
                                    ? `
                                        <button
                                            type="button"
                                            class="btn btn-sm btn-success"
                                            data-acao="selecionar"
                                            data-id="${id}"
                                            title="Pelada atual"
                                        >
                                            <i
                                                class="bi bi-check-circle-fill"
                                            ></i>
                                            <span
                                                class="d-none d-md-inline"
                                            >
                                                Atual
                                            </span>
                                        </button>
                                      `
                                    : (
                                        podeSelecionar
                                            ? `
                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-outline-success"
                                                    data-acao="selecionar"
                                                    data-id="${id}"
                                                    title="Usar esta pelada como atual"
                                                >
                                                    <i
                                                        class="bi bi-play-circle"
                                                    ></i>
                                                    <span
                                                        class="d-none d-md-inline"
                                                    >
                                                        Usar
                                                    </span>
                                                </button>
                                              `
                                            : ""
                                    )
                            }


                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary"
                                data-acao="detalhes"
                                data-id="${id}"
                                title="Detalhes"
                            >
                                <i
                                    class="bi bi-eye"
                                ></i>
                            </button>


                            <button
                                type="button"
                                class="btn btn-sm btn-outline-warning"
                                data-acao="editar"
                                data-id="${id}"
                                title="Editar"
                            >
                                <i
                                    class="bi bi-pencil"
                                ></i>
                            </button>


                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                data-acao="excluir"
                                data-id="${id}"
                                title="Excluir"
                            >
                                <i
                                    class="bi bi-trash"
                                ></i>
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }


        // ========================================================
        // INDICADOR DA PELADA ATUAL
        // ========================================================

        atualizarIndicadorPeladaAtual() {

            const pelada =
                this.obterPeladaAtual();


            const indicador =
                document.getElementById(
                    "peladaAtualIndicador"
                );


            if (!indicador) {

                return;

            }


            if (!pelada) {

                indicador.className =
                    "alert alert-secondary";

                indicador.innerHTML = `

                    <i class="bi bi-calendar-x me-1"></i>

                    Nenhuma pelada selecionada como atual.

                `;

                return;

            }


            indicador.className =
                "alert alert-success";


            indicador.innerHTML = `

                <div
                    class="d-flex
                           justify-content-between
                           align-items-center
                           gap-2
                           flex-wrap"
                >

                    <div>

                        <strong>
                            <i class="bi bi-check-circle-fill me-1"></i>
                            Pelada atual:
                        </strong>

                        ${this.escaparHtml(
                            pelada.nome ||
                            "Pelada da Fé"
                        )}

                        <span class="ms-2">
                            ${this.formatarData(
                                pelada.data
                            )}
                            ${
                                pelada.horario
                                    ? ` • ${this.escaparHtml(
                                        pelada.horario
                                    )}`
                                    : ""
                            }
                        </span>

                    </div>


                    <button
                        type="button"
                        class="btn btn-sm btn-outline-success"
                        id="btnDesmarcarPeladaAtual"
                    >
                        <i
                            class="bi bi-x-circle me-1"
                        ></i>
                        Desmarcar
                    </button>

                </div>

            `;


            const btnDesmarcar =
                document.getElementById(
                    "btnDesmarcarPeladaAtual"
                );


            if (btnDesmarcar) {

                btnDesmarcar.addEventListener(
                    "click",
                    () => {

                        this.limparPeladaAtual();

                    }
                );

            }

        }


        // ========================================================
        // VAZIO
        // ========================================================

        renderizarVazio(
            mensagem
        ) {

            const lista =
                document.getElementById(
                    "listaPeladas"
                );


            if (!lista) {

                return;

            }


            lista.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="text-center
                               text-muted
                               py-5"
                    >

                        <i
                            class="
                                bi
                                bi-calendar-x
                                fs-1
                                d-block
                                mb-3
                            "
                        ></i>

                        ${this.escaparHtml(
                            mensagem
                        )}

                    </td>

                </tr>

            `;


            const badge =
                document.getElementById(
                    "badgePeladas"
                );


            if (badge) {

                badge.textContent =
                    "0";

            }


            this.atualizarIndicadorPeladaAtual();

        }


        // ========================================================
        // RESUMO
        // ========================================================

        atualizarResumo() {

            const total =
                this.peladas.length;


            const agendadas =
                this.peladas.filter(
                    item =>
                        item.status ===
                        "Agendada"
                ).length;


            const finalizadas =
                this.peladas.filter(
                    item =>
                        item.status ===
                        "Finalizada"
                ).length;


            const partidas =
                this.peladas.reduce(
                    (
                        totalAtual,
                        item
                    ) => {

                        return (
                            totalAtual +
                            Number(
                                item.totalPartidas ||
                                0
                            )
                        );

                    },
                    0
                );


            this.definirTexto(
                "totalPeladas",
                total
            );


            this.definirTexto(
                "totalPeladasAgendadas",
                agendadas
            );


            this.definirTexto(
                "totalPeladasFinalizadas",
                finalizadas
            );


            this.definirTexto(
                "totalPartidasPeladas",
                partidas
            );

        }


        // ========================================================
        // STATUS
        // ========================================================

        obterClasseStatus(
            status
        ) {

            switch (
                status
            ) {

                case "Agendada":
                    return "bg-warning text-dark";


                case "Em andamento":
                    return "bg-primary";


                case "Finalizada":
                    return "bg-success";


                case "Cancelada":
                    return "bg-danger";


                default:
                    return "bg-secondary";

            }

        }


        // ========================================================
        // ID
        // ========================================================

        obterId(
            item
        ) {

            return (
                item?._id ||
                item?.id ||
                ""
            );

        }


        // ========================================================
        // DATA
        // ========================================================

        formatarData(
            valor
        ) {

            if (!valor) {

                return "--";

            }


            const data =
                new Date(
                    valor
                );


            if (
                Number.isNaN(
                    data.getTime()
                )
            ) {

                return "--";

            }


            return data.toLocaleDateString(
                "pt-BR"
            );

        }


        formatarDataInput(
            valor
        ) {

            if (!valor) {

                return "";

            }


            const data =
                new Date(
                    valor
                );


            if (
                Number.isNaN(
                    data.getTime()
                )
            ) {

                return "";

            }


            const ano =
                data.getFullYear();


            const mes =
                String(
                    data.getMonth() + 1
                )
                    .padStart(
                        2,
                        "0"
                    );


            const dia =
                String(
                    data.getDate()
                )
                    .padStart(
                        2,
                        "0"
                    );


            return `${ano}-${mes}-${dia}`;

        }


        // ========================================================
        // RESPONSE
        // ========================================================

        async lerResposta(
            resposta
        ) {

            try {

                return await resposta.json();

            } catch (erro) {

                return {};

            }

        }


        // ========================================================
        // MODAL
        // ========================================================

        abrirModal(
            modal
        ) {

            if (
                modal &&
                typeof modal.show ===
                "function"
            ) {

                modal.show();

            }

        }


        fecharModal(
            modal
        ) {

            if (
                modal &&
                typeof modal.hide ===
                "function"
            ) {

                modal.hide();

            }

        }


        // ========================================================
        // BOTÃO SALVAR
        // ========================================================

        alterarEstadoBotaoSalvar(
            botao,
            carregando
        ) {

            if (!botao) {

                return;

            }


            botao.disabled =
                carregando;


            if (carregando) {

                botao.innerHTML = `

                    <span
                        class="spinner-border
                               spinner-border-sm
                               me-2"
                    ></span>

                    Salvando...

                `;

            } else {

                botao.innerHTML = `

                    <i
                        class="bi bi-check-circle me-1"
                    ></i>

                    Salvar Pelada

                `;

            }

        }


        // ========================================================
        // ALERTA
        // ========================================================

        mostrarAlerta(
            mensagem,
            tipo
        ) {

            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire({

                    icon:
                        tipo,

                    title:
                        tipo ===
                        "success"
                            ? "Tudo certo!"
                            : "Atenção",

                    text:
                        mensagem

                });

                return;

            }


            alert(
                mensagem
            );

        }


        // ========================================================
        // CONFIRMAR EXCLUSÃO
        // ========================================================

        async confirmarExclusao(
            nome
        ) {

            if (
                typeof Swal ===
                "undefined"
            ) {

                return window.confirm(
                    `Deseja excluir ${nome}?`
                );

            }


            const resultado =
                await Swal.fire({

                    icon:
                        "warning",

                    title:
                        "Excluir pelada?",

                    text:
                        `Deseja realmente excluir ${nome}?`,

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


        // ========================================================
        // STATUS VISUAL
        // ========================================================

        mostrarStatus(
            mensagem,
            tipo
        ) {

            const elemento =
                document.getElementById(
                    "statusPeladas"
                );


            if (!elemento) {

                return;

            }


            elemento.className =
                `alert alert-${tipo}`;


            elemento.textContent =
                mensagem;

        }


        ocultarStatus() {

            const elemento =
                document.getElementById(
                    "statusPeladas"
                );


            if (!elemento) {

                return;

            }


            elemento.classList.add(
                "d-none"
            );

        }


        // ========================================================
        // DEFINIR TEXTO
        // ========================================================

        definirTexto(
            id,
            valor
        ) {

            const elemento =
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.textContent =
                    valor;

            }

        }


        // ========================================================
        // ESCAPAR HTML
        // ========================================================

        escaparHtml(
            valor
        ) {

            return String(
                valor ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        escaparAtributo(
            valor
        ) {

            return this.escaparHtml(
                valor
            );

        }


        // ========================================================
        // DESTROY
        // ========================================================

        destroy() {

            this.peladas = [];

            this.peladasFiltradas = [];

            this.modalPelada = null;

            this.modalDetalhes = null;

            console.log(
                "🧹 Módulo Peladas finalizado."
            );

        }

    }


    // ============================================================
    // INSTÂNCIA
    // ============================================================

    if (
        window.Peladas &&
        typeof window.Peladas.destroy ===
        "function"
    ) {

        try {

            window.Peladas.destroy();

        } catch (erro) {

            console.warn(
                "Erro ao destruir Peladas anterior:",
                erro
            );

        }

    }


    window.Peladas =
        new Peladas();


})();