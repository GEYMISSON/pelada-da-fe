const Jogador = require("../models/Jogador");

exports.listar = async (req, res) => {

    try {

        const jogadores = await Jogador.find().sort({
            nome: 1
        });

        res.json(jogadores);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

};

exports.criar = async (req, res) => {

    try {

        const jogador = new Jogador(req.body);

        await jogador.save();

        res.status(201).json(jogador);

    } catch (erro) {

        res.status(400).json({
            erro: erro.message
        });

    }

};

exports.atualizar = async (req, res) => {

    try {

        const jogador = await Jogador.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        res.json(jogador);

    } catch (erro) {

        res.status(400).json({
            erro: erro.message
        });

    }

};

exports.excluir = async (req, res) => {

    try {

        await Jogador.findByIdAndDelete(req.params.id);

        res.json({
            mensagem: "Jogador removido com sucesso."
        });

    } catch (erro) {

        res.status(400).json({
            erro: erro.message
        });

    }

};