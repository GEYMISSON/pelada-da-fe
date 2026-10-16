const mongoose = require("mongoose");

const configuracaoSchema = new mongoose.Schema(
    {
        chave: {
            type: String,
            required: true,
            unique: true,
            default: "geral",
            trim: true
        },

        duracaoPeladaMinutos: {
            type: Number,
            required: true,
            default: 60,
            min: 1,
            max: 720,
            validate: {
                validator: Number.isInteger,
                message: "A duração da Pelada precisa ser um número inteiro."
            }
        },

        duracaoPartidaMinutos: {
            type: Number,
            required: true,
            default: 7,
            min: 1,
            max: 720,
            validate: {
                validator: Number.isInteger,
                message: "A duração da partida precisa ser um número inteiro."
            }
        },

        temaAparencia: {
            type: String,
            enum: ["claro", "escuro"],
            required: true,
            default: "claro"
        }
    },
    {
        timestamps: true,
        collection: "configuracoes"
    }
);

module.exports =
    mongoose.models.Configuracao ||
    mongoose.model("Configuracao", configuracaoSchema);