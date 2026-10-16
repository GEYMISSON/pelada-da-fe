const express = require("express");
const Configuracao = require("../models/Configuracao");

const router = express.Router();

const CHAVE_CONFIGURACAO_GERAL = "geral";

const CONFIGURACOES_PADRAO = {
    chave: CHAVE_CONFIGURACAO_GERAL,
    duracaoPeladaMinutos: 60,
    duracaoPartidaMinutos: 7
};


function validarDuracoes(dados) {

    const duracaoPeladaMinutos = Number(
        dados?.duracaoPeladaMinutos
    );

    const duracaoPartidaMinutos = Number(
        dados?.duracaoPartidaMinutos
    );

    if (
        !Number.isInteger(duracaoPeladaMinutos) ||
        duracaoPeladaMinutos < 1 ||
        duracaoPeladaMinutos > 720
    ) {

        return {
            valido: false,
            mensagem:
                "A duração da Pelada precisa ser um número inteiro entre 1 e 720 minutos."
        };

    }

    if (
        !Number.isInteger(duracaoPartidaMinutos) ||
        duracaoPartidaMinutos < 1 ||
        duracaoPartidaMinutos > 720
    ) {

        return {
            valido: false,
            mensagem:
                "A duração da partida precisa ser um número inteiro entre 1 e 720 minutos."
        };

    }

    return {
        valido: true,

        configuracoes: {
            duracaoPeladaMinutos,
            duracaoPartidaMinutos
        }
    };

}


function formatarResposta(configuracao) {

    return {
        duracaoPeladaMinutos:
            configuracao.duracaoPeladaMinutos,

        duracaoPartidaMinutos:
            configuracao.duracaoPartidaMinutos
    };

}


// ============================================================
// GET /api/configuracoes
// Busca as configurações gerais.
// Se não houver registro, cria um com os valores padrão.
// ============================================================

router.get("/", async (req, res) => {

    try {

        const configuracao =
            await Configuracao.findOneAndUpdate(
                {
                    chave: CHAVE_CONFIGURACAO_GERAL
                },
                {
                    $setOnInsert: CONFIGURACOES_PADRAO
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

        return res.json({
            sucesso: true,

            configuracoes:
                formatarResposta(configuracao)
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar as configurações do MongoDB:",
            erro
        );

        return res.status(500).json({
            sucesso: false,

            erro:
                "Não foi possível carregar as configurações do servidor."
        });

    }

});


// ============================================================
// PUT /api/configuracoes
// Salva as configurações gerais no MongoDB.
// ============================================================

router.put("/", async (req, res) => {

    const validacao =
        validarDuracoes(req.body);

    if (!validacao.valido) {

        return res.status(400).json({
            sucesso: false,
            erro: validacao.mensagem
        });

    }

    try {

        const configuracao =
            await Configuracao.findOneAndUpdate(
                {
                    chave: CHAVE_CONFIGURACAO_GERAL
                },
                {
                    $set:
                        validacao.configuracoes,

                    $setOnInsert: {
                        chave: CHAVE_CONFIGURACAO_GERAL
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

        return res.json({
            sucesso: true,

            mensagem:
                "Configurações salvas no MongoDB.",

            configuracoes:
                formatarResposta(configuracao)
        });

    } catch (erro) {

        console.error(
            "Erro ao salvar as configurações no MongoDB:",
            erro
        );

        return res.status(500).json({
            sucesso: false,

            erro:
                "Não foi possível salvar as configurações no banco de dados."
        });

    }

});


module.exports = router;