const mongoose = require("mongoose");

const golSchema = new mongoose.Schema({

    jogador: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Jogador"

    },

    partida: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Partida"

    },

    quantidade: {

        type: Number,

        default: 1

    },

    criadoEm: {

        type: Date,

        default: Date.now

    }

});

module.exports = mongoose.model("Gol", golSchema);