const mongoose = require("mongoose");

const jogadorSchema = new mongoose.Schema({

    foto: {
        type: String,
        default: ""
    },

    nome: {
        type: String,
        required: true,
        trim: true
    },

    dataNascimento: {
        type: Date
    },

    posicao: {
        type: String,
        default: ""
    },

    numeroCamisa: {
        type: Number
    },

    nivel: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    status: {
        type: String,
        enum: ["Ativo", "Inativo"],
        default: "Ativo"
    },

    criadoEm: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Jogador", jogadorSchema);