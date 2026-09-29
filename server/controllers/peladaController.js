const mongoose = require("mongoose");

const Pelada = require("../models/Pelada");
const Partida = require("../models/Partida");


// ============================================================
// LISTAR PELADAS
// ============================================================

async function listar(req, res) {

    try {

        const peladas =
            await Pelada
                .find()
                .sort({
                    data: -1,
                    createdAt: -1
                })
                .lean();


        // ----------------------------------------------------
        // Quantidade de partidas de cada pelada
        // ----------------------------------------------------

        const resultado =
            await Promise.all(

                peladas.map(
                    async pelada => {

                        const totalPartidas =
                            await Partida.countDocuments({
                                pelada:
                                    pelada._id
                            });


                        return {
                            ...pelada,

                            totalPartidas
                        };

                    }
                )

            );


        return res.json(
            resultado
        );

    } catch (erro) {

        console.error(
            "Erro ao listar peladas:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao listar as peladas.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// BUSCAR PELADA POR ID
// ============================================================

async function buscar(req, res) {

    try {

        const { id } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                id
            )
        ) {

            return res.status(400).json({

                erro:
                    "ID da pelada inválido."

            });

        }


        const pelada =
            await Pelada.findById(
                id
            )
            .lean();


        if (!pelada) {

            return res.status(404).json({

                erro:
                    "Pelada não encontrada."

            });

        }


        const totalPartidas =
            await Partida.countDocuments({
                pelada: id
            });


        return res.json({

            ...pelada,

            totalPartidas

        });

    } catch (erro) {

        console.error(
            "Erro ao buscar pelada:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao buscar a pelada.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// CRIAR PELADA
// ============================================================

async function criar(req, res) {

    try {

        const {

            nome,

            data,

            horario,

            local,

            descricao,

            observacoes,

            quantidadeTimes,

            duracaoMinutos,

            status

        } = req.body;


        // ----------------------------------------------------
        // VALIDAÇÕES
        // ----------------------------------------------------

        if (!data) {

            return res.status(400).json({

                erro:
                    "A data da pelada é obrigatória."

            });

        }


        if (!horario) {

            return res.status(400).json({

                erro:
                    "O horário da pelada é obrigatório."

            });

        }


        const dataConvertida =
            new Date(data);


        if (
            Number.isNaN(
                dataConvertida.getTime()
            )
        ) {

            return res.status(400).json({

                erro:
                    "A data informada é inválida."

            });

        }


        const quantidade =
            Number(
                quantidadeTimes ?? 3
            );


        if (
            !Number.isInteger(
                quantidade
            ) ||
            quantidade < 2 ||
            quantidade > 10
        ) {

            return res.status(400).json({

                erro:
                    "A quantidade de times deve estar entre 2 e 10."

            });

        }


        const duracao =
            Number(
                duracaoMinutos ?? 60
            );


        if (
            !Number.isInteger(
                duracao
            ) ||
            duracao < 1 ||
            duracao > 720
        ) {

            return res.status(400).json({

                erro:
                    "A duração deve estar entre 1 e 720 minutos."

            });

        }


        const statusPermitidos = [

            "Agendada",
            "Em andamento",
            "Finalizada",
            "Cancelada"

        ];


        const statusFinal =
            status ||
            "Agendada";


        if (
            !statusPermitidos.includes(
                statusFinal
            )
        ) {

            return res.status(400).json({

                erro:
                    "Status da pelada inválido."

            });

        }


        // ----------------------------------------------------
        // CRIAR
        // ----------------------------------------------------

        const pelada =
            await Pelada.create({

                nome:
                    nome ||
                    "Pelada da Fé",

                data:
                    dataConvertida,

                horario:
                    String(
                        horario
                    ).trim(),

                local:
                    local ||
                    "",

                descricao:
                    descricao ||
                    "",

                observacoes:
                    observacoes ||
                    "",

                quantidadeTimes:
                    quantidade,

                duracaoMinutos:
                    duracao,

                status:
                    statusFinal

            });


        return res.status(201).json({

            mensagem:
                "Pelada criada com sucesso.",

            pelada

        });

    } catch (erro) {

        console.error(
            "Erro ao criar pelada:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao criar a pelada.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// ATUALIZAR PELADA
// ============================================================

async function atualizar(req, res) {

    try {

        const { id } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                id
            )
        ) {

            return res.status(400).json({

                erro:
                    "ID da pelada inválido."

            });

        }


        const {

            nome,

            data,

            horario,

            local,

            descricao,

            observacoes,

            quantidadeTimes,

            duracaoMinutos,

            status

        } = req.body;


        const dados = {};


        // ----------------------------------------------------
        // CAMPOS
        // ----------------------------------------------------

        if (
            nome !== undefined
        ) {

            dados.nome =
                String(
                    nome
                ).trim();

        }


        if (
            data !== undefined
        ) {

            const dataConvertida =
                new Date(data);


            if (
                Number.isNaN(
                    dataConvertida.getTime()
                )
            ) {

                return res.status(400).json({

                    erro:
                        "A data informada é inválida."

                });

            }


            dados.data =
                dataConvertida;

        }


        if (
            horario !== undefined
        ) {

            dados.horario =
                String(
                    horario
                ).trim();

        }


        if (
            local !== undefined
        ) {

            dados.local =
                String(
                    local
                ).trim();

        }


        if (
            descricao !== undefined
        ) {

            dados.descricao =
                String(
                    descricao
                ).trim();

        }


        if (
            observacoes !== undefined
        ) {

            dados.observacoes =
                String(
                    observacoes
                ).trim();

        }


        if (
            quantidadeTimes !== undefined
        ) {

            const quantidade =
                Number(
                    quantidadeTimes
                );


            if (
                !Number.isInteger(
                    quantidade
                ) ||
                quantidade < 2 ||
                quantidade > 10
            ) {

                return res.status(400).json({

                    erro:
                        "A quantidade de times deve estar entre 2 e 10."

                });

            }


            dados.quantidadeTimes =
                quantidade;

        }


        if (
            duracaoMinutos !== undefined
        ) {

            const duracao =
                Number(
                    duracaoMinutos
                );


            if (
                !Number.isInteger(
                    duracao
                ) ||
                duracao < 1 ||
                duracao > 720
            ) {

                return res.status(400).json({

                    erro:
                        "A duração deve estar entre 1 e 720 minutos."

                });

            }


            dados.duracaoMinutos =
                duracao;

        }


        if (
            status !== undefined
        ) {

            const statusPermitidos = [

                "Agendada",
                "Em andamento",
                "Finalizada",
                "Cancelada"

            ];


            if (
                !statusPermitidos.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    erro:
                        "Status da pelada inválido."

                });

            }


            dados.status =
                status;

        }


        // ----------------------------------------------------
        // ATUALIZAR
        // ----------------------------------------------------

        const pelada =
            await Pelada.findByIdAndUpdate(

                id,

                dados,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!pelada) {

            return res.status(404).json({

                erro:
                    "Pelada não encontrada."

            });

        }


        return res.json({

            mensagem:
                "Pelada atualizada com sucesso.",

            pelada

        });

    } catch (erro) {

        console.error(
            "Erro ao atualizar pelada:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao atualizar a pelada.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// EXCLUIR PELADA
// ============================================================

async function excluir(req, res) {

    try {

        const { id } =
            req.params;


        if (
            !mongoose.isValidObjectId(
                id
            )
        ) {

            return res.status(400).json({

                erro:
                    "ID da pelada inválido."

            });

        }


        // ----------------------------------------------------
        // VERIFICAR PARTIDAS VINCULADAS
        // ----------------------------------------------------

        const totalPartidas =
            await Partida.countDocuments({
                pelada: id
            });


        if (
            totalPartidas > 0
        ) {

            return res.status(409).json({

                erro:
                    "Não é possível excluir esta pelada.",

                detalhes:
                    `Existem ${totalPartidas} partida(s) vinculada(s) a ela.`

            });

        }


        const pelada =
            await Pelada.findByIdAndDelete(
                id
            );


        if (!pelada) {

            return res.status(404).json({

                erro:
                    "Pelada não encontrada."

            });

        }


        return res.json({

            mensagem:
                "Pelada excluída com sucesso."

        });

    } catch (erro) {

        console.error(
            "Erro ao excluir pelada:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao excluir a pelada.",

            detalhes:
                erro.message

        });

    }

}


module.exports = {

    listar,

    buscar,

    criar,

    atualizar,

    excluir

};