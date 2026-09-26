const mongoose = require("mongoose");

const golSchema = new mongoose.Schema(
    {
        partida: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Partida",
            required: true
        },

        jogador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Jogador",
            required: true
        },

        nomeJogador: {
            type: String,
            required: true,
            trim: true
        },

        time: {
            type: String,
            enum: ["Amarelo", "Vermelho", "Azul"],
            required: true
        },

        minuto: {
            type: Number,
            required: false,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Gol", golSchema);