const mongoose = require("mongoose");

const partidaSchema = new mongoose.Schema({

    pelada: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Pelada"

    },

    timeA: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Time"

    },

    timeB: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Time"

    },

    golsTimeA: {

        type: Number,

        default: 0

    },

    golsTimeB: {

        type: Number,

        default: 0

    },

    finalizada: {

        type: Boolean,

        default: false

    }

});

module.exports = mongoose.model("Partida", partidaSchema);