const mongoose = require("mongoose");

const peladaSchema = new mongoose.Schema({

    data: Date,

    local: String,

    observacoes: String,

    quantidadeTimes: Number,

    status: {
        type: String,
        default: "Aberta"
    },

    criadaEm: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Pelada", peladaSchema);