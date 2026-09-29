const mongoose = require("mongoose");

const peladaSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            default: "Pelada da Fé",
            trim: true,
            maxlength: 100
        },

        data: {
            type: Date,
            required: true
        },

        horario: {
            type: String,
            required: true,
            trim: true
        },

        local: {
            type: String,
            trim: true,
            maxlength: 150
        },

        descricao: {
            type: String,
            trim: true,
            maxlength: 500
        },

        observacoes: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        quantidadeTimes: {
            type: Number,
            default: 3,
            min: 2,
            max: 10
        },

        duracaoMinutos: {
            type: Number,
            default: 60,
            min: 1,
            max: 720
        },

        status: {
            type: String,
            enum: [
                "Agendada",
                "Em andamento",
                "Finalizada",
                "Cancelada"
            ],
            default: "Agendada"
        },

        criadaEm: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Pelada",
    peladaSchema
);