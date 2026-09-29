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

                                <small
                                    class="text-muted"
                                >
                                    Pelada
                                </small>

                                <h4
                                    class="fw-bold mb-3"
                                >
                                    ${this.escaparHtml(
                                        pelada.nome ||
                                        "Pelada da Fé"
                                    )}
                                </h4>


                                <div
                                    class="row g-3"
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


            return `

                <tr>


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

                        <div class="fw-bold">

                            ${this.escaparHtml(
                                pelada.nome ||
                                "Pelada da Fé"
                            )}

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
                                   gap-1"
                        >

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