const mongoose = require("mongoose");

const jogadorSchema = new mongoose.Schema(
{
    foto:{
        type:String,
        default:""
    },

    nome:{
        type:String,
        required:true,
        trim:true
    },

    dataNascimento:{
        type:Date
    },

    posicao:{
        type:String,
        default:""
    },

    numeroCamisa:{
        type:Number,
        default:null
    },

    nivel:{
        type:Number,
        default:3,
        min:1,
        max:5
    },

    gols:{
        type:Number,
        default:0
    },

    assistencias:{
        type:Number,
        default:0
    },

    status:{
        type:String,
        enum:["Ativo","Inativo"],
        default:"Ativo"
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Jogador", jogadorSchema);