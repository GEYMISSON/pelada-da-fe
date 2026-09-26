const Gol = require("../models/Gol");
const Jogador = require("../models/Jogador");


// ============================================================
// LISTAR TODOS OS GOLS
// ============================================================

async function listar(req, res) {

    try {

        const gols = await Gol.find()
            .populate("partida")
            .populate(
                "jogador",
                "nome numeroCamisa foto"
            )
            .sort({
                createdAt: -1
            });

        return res.json(gols);

    } catch (erro) {

        console.error(
            "❌ Erro ao listar gols:",
            erro
        );

        return res.status(500).json({

            erro:
                "Erro ao listar gols.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// BUSCAR GOL POR ID
// ============================================================

async function buscar(req, res) {

    try {

        const gol =
            await Gol.findById(
                req.params.id
            )
            .populate("partida")
            .populate(
                "jogador",
                "nome numeroCamisa foto"
            );


        if (!gol) {

            return res.status(404).json({

                erro:
                    "Gol não encontrado."

            });

        }


        return res.json(gol);

    } catch (erro) {

        console.error(
            "❌ Erro ao buscar gol:",
            erro
        );

        return res.status(500).json({

            erro:
                "Erro ao buscar gol.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// CRIAR GOL
// ============================================================

async function criar(req, res) {

    try {

        const {
            partida,
            jogador,
            nomeJogador,
            time,
            minuto
        } = req.body;


        // ----------------------------------------------------
        // VALIDAÇÕES
        // ----------------------------------------------------

        if (!partida) {

            return res.status(400).json({

                erro:
                    "A partida é obrigatória."

            });

        }


        if (!jogador) {

            return res.status(400).json({

                erro:
                    "O jogador é obrigatório."

            });

        }


        if (!nomeJogador) {

            return res.status(400).json({

                erro:
                    "O nome do jogador é obrigatório."

            });

        }


        if (!time) {

            return res.status(400).json({

                erro:
                    "O time é obrigatório."

            });

        }


        const timesPermitidos = [

            "Amarelo",
            "Vermelho",
            "Azul"

        ];


        if (
            !timesPermitidos.includes(time)
        ) {

            return res.status(400).json({

                erro:
                    "Time inválido."

            });

        }


        // ----------------------------------------------------
        // VERIFICAR JOGADOR
        // ----------------------------------------------------

        const jogadorEncontrado =
            await Jogador.findById(
                jogador
            );


        if (!jogadorEncontrado) {

            return res.status(404).json({

                erro:
                    "Jogador não encontrado."

            });

        }


        // ----------------------------------------------------
        // CRIAR GOL
        // ----------------------------------------------------

        const novoGol =
            await Gol.create({

                partida,

                jogador,

                nomeJogador,

                time,

                minuto:
                    minuto !== undefined &&
                    minuto !== null &&
                    minuto !== ""
                        ? Number(minuto)
                        : undefined

            });


        // ----------------------------------------------------
        // ATUALIZAR TOTAL DE GOLS DO JOGADOR
        // ----------------------------------------------------

        const jogadorAtualizado =
            await Jogador.findByIdAndUpdate(

                jogador,

                {
                    $inc: {
                        gols: 1
                    }
                },

                {
                    new: true
                }

            );


        if (!jogadorAtualizado) {

            /*
             * Segurança:
             * se o gol foi criado mas o jogador
             * não puder ser atualizado, removemos
             * o gol recém-criado para não deixar
             * os dados inconsistentes.
             */

            await Gol.findByIdAndDelete(
                novoGol._id
            );


            return res.status(500).json({

                erro:
                    "O gol não pôde ser sincronizado com o jogador."

            });

        }


        // ----------------------------------------------------
        // BUSCAR GOL COMPLETO
        // ----------------------------------------------------

        const golSalvo =
            await Gol.findById(
                novoGol._id
            )
            .populate("partida")
            .populate(
                "jogador",
                "nome numeroCamisa foto gols assistencias"
            );


        console.log(
            "⚽ Gol salvo no MongoDB:",
            golSalvo._id.toString()
        );


        console.log(
            "📊 Gols do jogador atualizados:",
            jogadorAtualizado.nome,
            jogadorAtualizado.gols
        );


        return res.status(201).json(
            golSalvo
        );


    } catch (erro) {

        console.error(
            "❌ Erro ao criar gol:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao salvar gol.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// LISTAR GOLS DE UMA PARTIDA
// ============================================================

async function listarPorPartida(req, res) {

    try {

        const gols =
            await Gol.find({

                partida:
                    req.params.partidaId

            })
            .populate(
                "jogador",
                "nome numeroCamisa foto gols assistencias"
            )
            .sort({
                createdAt: 1
            });


        return res.json(
            gols
        );


    } catch (erro) {

        console.error(
            "❌ Erro ao listar gols da partida:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao listar gols da partida.",

            detalhes:
                erro.message

        });

    }

}


// ============================================================
// EXCLUIR GOL
// ============================================================

async function excluir(req, res) {

    try {

        // ----------------------------------------------------
        // BUSCAR GOL
        // ----------------------------------------------------

        const gol =
            await Gol.findById(
                req.params.id
            );


        if (!gol) {

            return res.status(404).json({

                erro:
                    "Gol não encontrado."

            });

        }


        // ----------------------------------------------------
        // EXCLUIR GOL
        // ----------------------------------------------------

        await Gol.findByIdAndDelete(
            req.params.id
        );


        // ----------------------------------------------------
        // DIMINUIR GOL DO JOGADOR
        // ----------------------------------------------------

        const jogadorAtualizado =
            await Jogador.findByIdAndUpdate(

                gol.jogador,

                {
                    $inc: {
                        gols: -1
                    }
                },

                {
                    new: true
                }

            );


        if (!jogadorAtualizado) {

            console.warn(

                "⚠️ Gol excluído, mas jogador não encontrado:",
                gol.jogador

            );

        }


        console.log(
            "🗑️ Gol excluído:",
            req.params.id
        );


        if (jogadorAtualizado) {

            console.log(

                "📊 Gols do jogador atualizados:",

                jogadorAtualizado.nome,

                jogadorAtualizado.gols

            );

        }


        return res.json({

            mensagem:
                "Gol excluído com sucesso.",

            gol

        });


    } catch (erro) {

        console.error(
            "❌ Erro ao excluir gol:",
            erro
        );


        return res.status(500).json({

            erro:
                "Erro ao excluir gol.",

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

    listarPorPartida,

    excluir

};