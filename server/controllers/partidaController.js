const Partida = require("../models/Partida");


// ============================================================
// LISTAR PARTIDAS
// ============================================================

exports.listar = async (req, res) => {

    try {

        const partidas = await Partida
            .find()
            .populate("jogadoresTimeA", "nome numeroCamisa")
            .populate("jogadoresTimeB", "nome numeroCamisa")
            .sort({
                createdAt: -1
            });


        res.json(partidas);

    } catch (erro) {

        console.error(
            "Erro ao listar partidas:",
            erro
        );

        res.status(500).json({

            erro:
                "Erro ao listar partidas.",

            detalhes:
                erro.message

        });

    }

};


// ============================================================
// BUSCAR PARTIDA POR ID
// ============================================================

exports.buscar = async (req, res) => {

    try {

        const partida =
            await Partida
                .findById(req.params.id)
                .populate(
                    "jogadoresTimeA",
                    "nome numeroCamisa"
                )
                .populate(
                    "jogadoresTimeB",
                    "nome numeroCamisa"
                );


        if (!partida) {

            return res.status(404).json({

                erro:
                    "Partida não encontrada."

            });

        }


        res.json(partida);

    } catch (erro) {

        console.error(
            "Erro ao buscar partida:",
            erro
        );

        res.status(500).json({

            erro:
                "Erro ao buscar partida.",

            detalhes:
                erro.message

        });

    }

};


// ============================================================
// CRIAR PARTIDA
// ============================================================

exports.criar = async (req, res) => {

    try {

        const {

            nomeTimeA,

            nomeTimeB,

            jogadoresTimeA,

            jogadoresTimeB,

            golsTimeA,

            golsTimeB,

            vencedor,

            numero,

            duracaoSegundos,

            iniciadaEm,

            finalizadaEm,

            finalizada

        } = req.body;


        // --------------------------------------------------------
        // VALIDAÇÕES
        // --------------------------------------------------------

        if (!nomeTimeA || !nomeTimeB) {

            return res.status(400).json({

                erro:
                    "Os nomes dos dois times são obrigatórios."

            });

        }


        const placarA =
            Number.isFinite(Number(golsTimeA))
                ? Number(golsTimeA)
                : 0;


        const placarB =
            Number.isFinite(Number(golsTimeB))
                ? Number(golsTimeB)
                : 0;


        if (
            placarA < 0 ||
            placarB < 0
        ) {

            return res.status(400).json({

                erro:
                    "O placar não pode ser negativo."

            });

        }


        // --------------------------------------------------------
        // VERIFICAR VENCEDOR
        // --------------------------------------------------------

        if (placarA === placarB) {

            return res.status(400).json({

                erro:
                    "Uma partida não pode ser finalizada empatada."

            });

        }


        const vencedorCalculado =
            placarA > placarB
                ? "timeA"
                : "timeB";


        // --------------------------------------------------------
        // CRIAR PARTIDA
        // --------------------------------------------------------

        const partida =
            await Partida.create({

                nomeTimeA:
                    nomeTimeA.trim(),

                nomeTimeB:
                    nomeTimeB.trim(),

                jogadoresTimeA:
                    Array.isArray(jogadoresTimeA)
                        ? jogadoresTimeA
                        : [],

                jogadoresTimeB:
                    Array.isArray(jogadoresTimeB)
                        ? jogadoresTimeB
                        : [],

                golsTimeA:
                    placarA,

                golsTimeB:
                    placarB,

                vencedor:
                    vencedorCalculado,

                numero:
                    numero
                        ? Number(numero)
                        : undefined,

                duracaoSegundos:
                    duracaoSegundos
                        ? Number(duracaoSegundos)
                        : 0,

                iniciadaEm:
                    iniciadaEm
                        ? new Date(iniciadaEm)
                        : undefined,

                finalizadaEm:
                    finalizadaEm
                        ? new Date(finalizadaEm)
                        : new Date(),

                finalizada:
                    finalizada !== false

            });


        // --------------------------------------------------------
        // RETORNAR PARTIDA
        // --------------------------------------------------------

        const partidaCompleta =
            await Partida
                .findById(partida._id)
                .populate(
                    "jogadoresTimeA",
                    "nome numeroCamisa"
                )
                .populate(
                    "jogadoresTimeB",
                    "nome numeroCamisa"
                );


        res.status(201).json({

            sucesso: true,

            mensagem:
                "Partida salva com sucesso.",

            partida:
                partidaCompleta

        });

    } catch (erro) {

        console.error(
            "Erro ao criar partida:",
            erro
        );


        res.status(400).json({

            erro:
                "Erro ao salvar partida.",

            detalhes:
                erro.message

        });

    }

};


// ============================================================
// EXCLUIR PARTIDA
// ============================================================

exports.excluir = async (req, res) => {

    try {

        const partida =
            await Partida.findByIdAndDelete(
                req.params.id
            );


        if (!partida) {

            return res.status(404).json({

                erro:
                    "Partida não encontrada."

            });

        }


        res.json({

            sucesso: true,

            mensagem:
                "Partida excluída com sucesso."

        });

    } catch (erro) {

        console.error(
            "Erro ao excluir partida:",
            erro
        );

        res.status(500).json({

            erro:
                "Erro ao excluir partida.",

            detalhes:
                erro.message

        });

    }

};