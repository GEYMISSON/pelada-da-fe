const mongoose = require("mongoose");

const Partida =
    require("../models/Partida");

const Pelada =
    require("../models/Pelada");


// ============================================================
// LISTAR
// ============================================================

async function listar(
    req,
    res
) {

    try {

        const partidas =
            await Partida
                .find()
                .populate(
                    "pelada",
                    "nome data horario local status"
                )
                .populate(
                    "jogadoresTimeA",
                    "nome numeroCamisa"
                )
                .populate(
                    "jogadoresTimeB",
                    "nome numeroCamisa"
                )
                .sort({
                    createdAt: -1
                });


        return res.json(
            partidas
        );

    } catch (erro) {

        console.error(
            "Erro ao listar partidas:",
            erro
        );


        return res.status(500).json({

            erro:
                "Não foi possível listar as partidas.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// BUSCAR
// ============================================================

async function buscar(
    req,
    res
) {

    try {

        const {
            id
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({

                erro:
                    "ID da partida inválido."

            });

        }


        const partida =
            await Partida
                .findById(id)
                .populate(
                    "pelada",
                    "nome data horario local status"
                )
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


        return res.json(
            partida
        );

    } catch (erro) {

        console.error(
            "Erro ao buscar partida:",
            erro
        );


        return res.status(500).json({

            erro:
                "Não foi possível buscar a partida.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// CRIAR
// ============================================================

async function criar(
    req,
    res
) {

    try {

        const {

            pelada,

            timeA,
            timeB,

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
        // VALIDAR NOMES DOS TIMES
        // --------------------------------------------------------

        if (
            !nomeTimeA ||
            !nomeTimeB
        ) {

            return res.status(400).json({

                erro:
                    "Os nomes dos dois times são obrigatórios."

            });

        }


        // --------------------------------------------------------
        // VALIDAR GOLS
        // --------------------------------------------------------

        const placarA =
            Number(
                golsTimeA || 0
            );


        const placarB =
            Number(
                golsTimeB || 0
            );


        if (
            !Number.isFinite(
                placarA
            ) ||
            !Number.isFinite(
                placarB
            )
        ) {

            return res.status(400).json({

                erro:
                    "Os gols informados são inválidos."

            });

        }


        if (
            placarA < 0 ||
            placarB < 0
        ) {

            return res.status(400).json({

                erro:
                    "A quantidade de gols não pode ser negativa."

            });

        }


        // --------------------------------------------------------
        // NÃO ACEITAR EMPATE
        // --------------------------------------------------------

        if (
            placarA === placarB
        ) {

            return res.status(400).json({

                erro:
                    "A partida não pode ser salva empatada."

            });

        }


        // --------------------------------------------------------
        // VALIDAR PELADA
        // --------------------------------------------------------

        let peladaValida =
            null;


        if (pelada) {

            if (
                !mongoose.Types.ObjectId.isValid(
                    pelada
                )
            ) {

                return res.status(400).json({

                    erro:
                        "O ID da pelada é inválido."

                });

            }


            peladaValida =
                await Pelada.findById(
                    pelada
                );


            if (!peladaValida) {

                return res.status(404).json({

                    erro:
                        "A pelada informada não foi encontrada."

                });

            }


            // Pelada cancelada não pode receber novas partidas.
            if (
                peladaValida.status ===
                "Cancelada"
            ) {

                return res.status(400).json({

                    erro:
                        "Não é possível registrar uma partida em uma pelada cancelada."

                });

            }

        }


        // --------------------------------------------------------
        // CALCULAR VENCEDOR
        // --------------------------------------------------------

        const vencedorCalculado =
            placarA > placarB
                ? "timeA"
                : "timeB";


        // --------------------------------------------------------
        // PAYLOAD
        // --------------------------------------------------------

        const dadosPartida = {

            nomeTimeA:
                String(
                    nomeTimeA
                ).trim(),

            nomeTimeB:
                String(
                    nomeTimeB
                ).trim(),

            jogadoresTimeA:
                Array.isArray(
                    jogadoresTimeA
                )
                    ? jogadoresTimeA
                    : [],

            jogadoresTimeB:
                Array.isArray(
                    jogadoresTimeB
                )
                    ? jogadoresTimeB
                    : [],

            golsTimeA:
                placarA,

            golsTimeB:
                placarB,

            vencedor:
                vencedorCalculado,

            finalizada:
                typeof finalizada ===
                "boolean"
                    ? finalizada
                    : true

        };


        // --------------------------------------------------------
        // CAMPOS OPCIONAIS
        // --------------------------------------------------------

        if (
            peladaValida
        ) {

            dadosPartida.pelada =
                peladaValida._id;

        }


        if (
            timeA &&
            mongoose.Types.ObjectId.isValid(
                timeA
            )
        ) {

            dadosPartida.timeA =
                timeA;

        }


        if (
            timeB &&
            mongoose.Types.ObjectId.isValid(
                timeB
            )
        ) {

            dadosPartida.timeB =
                timeB;

        }


        if (
            Number.isFinite(
                Number(
                    numero
                )
            ) &&
            Number(
                numero
            ) > 0
        ) {

            dadosPartida.numero =
                Number(
                    numero
                );

        }


        if (
            Number.isFinite(
                Number(
                    duracaoSegundos
                )
            ) &&
            Number(
                duracaoSegundos
            ) >= 0
        ) {

            dadosPartida.duracaoSegundos =
                Number(
                    duracaoSegundos
                );

        }


        if (
            iniciadaEm
        ) {

            const dataInicio =
                new Date(
                    iniciadaEm
                );


            if (
                !Number.isNaN(
                    dataInicio.getTime()
                )
            ) {

                dadosPartida.iniciadaEm =
                    dataInicio;

            }

        }


        if (
            finalizadaEm
        ) {

            const dataFinal =
                new Date(
                    finalizadaEm
                );


            if (
                !Number.isNaN(
                    dataFinal.getTime()
                )
            ) {

                dadosPartida.finalizadaEm =
                    dataFinal;

            }

        }


        // --------------------------------------------------------
        // CRIAR
        // --------------------------------------------------------

        const partida =
            await Partida.create(
                dadosPartida
            );


        // --------------------------------------------------------
        // BUSCAR NOVAMENTE COM POPULATE
        // --------------------------------------------------------

        const partidaCompleta =
            await Partida
                .findById(
                    partida._id
                )
                .populate(
                    "pelada",
                    "nome data horario local status"
                )
                .populate(
                    "jogadoresTimeA",
                    "nome numeroCamisa"
                )
                .populate(
                    "jogadoresTimeB",
                    "nome numeroCamisa"
                );


        console.log(
            "✅ Partida criada:",
            partidaCompleta._id
        );


        if (
            partidaCompleta.pelada
        ) {

            console.log(
                "🏆 Pelada vinculada:",
                partidaCompleta.pelada.nome,
                partidaCompleta.pelada._id
            );

        }


        return res.status(201).json({

            mensagem:
                "Partida criada com sucesso.",

            partida:
                partidaCompleta

        });

    } catch (erro) {

        console.error(
            "Erro ao criar partida:",
            erro
        );


        return res.status(500).json({

            erro:
                "Não foi possível criar a partida.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// EXCLUIR
// ============================================================

async function excluir(
    req,
    res
) {

    try {

        const {
            id
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({

                erro:
                    "ID da partida inválido."

            });

        }


        const partida =
            await Partida.findByIdAndDelete(
                id
            );


        if (!partida) {

            return res.status(404).json({

                erro:
                    "Partida não encontrada."

            });

        }


        console.log(
            "🗑️ Partida excluída:",
            id
        );


        return res.json({

            mensagem:
                "Partida excluída com sucesso."

        });

    } catch (erro) {

        console.error(
            "Erro ao excluir partida:",
            erro
        );


        return res.status(500).json({

            erro:
                "Não foi possível excluir a partida.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {

    listar,

    buscar,

    criar,

    excluir

};