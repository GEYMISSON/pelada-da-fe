const mongoose = require("mongoose");

const partidaSchema = new mongoose.Schema(
    {

        // ========================================================
        // PELADA
        // ========================================================

        pelada: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Pelada",

            required: false

        },


        // ========================================================
        // TIMES - REFERÊNCIA FUTURA
        // ========================================================

        timeA: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Time",

            required: false

        },

        timeB: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Time",

            required: false

        },


        // ========================================================
        // NOMES DOS TIMES
        //
        // Guardamos também o nome para preservar exatamente
        // como a partida aconteceu.
        // ========================================================

        nomeTimeA: {

            type: String,

            required: true,

            trim: true

        },

        nomeTimeB: {

            type: String,

            required: true,

            trim: true

        },


        // ========================================================
        // JOGADORES DOS TIMES
        //
        // Isso permitirá futuramente relacionar os gols
        // diretamente aos jogadores.
        // ========================================================

        jogadoresTimeA: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "Jogador"

            }

        ],

        jogadoresTimeB: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "Jogador"

            }

        ],


        // ========================================================
        // PLACAR
        // ========================================================

        golsTimeA: {

            type: Number,

            default: 0,

            min: 0

        },

        golsTimeB: {

            type: Number,

            default: 0,

            min: 0

        },


        // ========================================================
        // VENCEDOR
        // ========================================================

        vencedor: {

            type: String,

            enum: [

                "timeA",

                "timeB"

            ],

            required: false

        },


        // ========================================================
        // NÚMERO DA PARTIDA
        // ========================================================

        numero: {

            type: Number,

            required: false,

            min: 1

        },


        // ========================================================
        // DURAÇÃO
        //
        // Tempo efetivamente jogado em segundos.
        // ========================================================

        duracaoSegundos: {

            type: Number,

            default: 0,

            min: 0

        },


        // ========================================================
        // DATAS
        // ========================================================

        iniciadaEm: {

            type: Date,

            required: false

        },

        finalizadaEm: {

            type: Date,

            default: Date.now

        },


        // ========================================================
        // STATUS
        // ========================================================

        finalizada: {

            type: Boolean,

            default: false

        }

    },

    {

        timestamps: true

    }
);


// ============================================================
// EXPORTAR
// ============================================================

module.exports =
    mongoose.model(
        "Partida",
        partidaSchema
    );