const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({

    nome: String,

    cor: String,

    jogadores: [{

        type: mongoose.Schema.Types.ObjectId,

        ref: "Jogador"

    }],

    pelada: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Pelada"

    }

});

module.exports = mongoose.model("Time", timeSchema);