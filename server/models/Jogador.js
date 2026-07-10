const mongoose = require("mongoose");

const jogadorSchema = new mongoose.Schema(
  {
    foto: {
      type: String,
      default: "",
    },

    nome: {
      type: String,
      required: [true, "O nome é obrigatório."],
      trim: true,
    },

    dataNascimento: {
      type: Date,
    },

    posicao: {
      type: String,
      enum: [
        "",
        "Goleiro",
        "Zagueiro",
        "Lateral",
        "Volante",
        "Meia",
        "Atacante",
      ],
      default: "",
    },

    numeroCamisa: {
      type: Number,
      min: 1,
      max: 99,
    },

    nivel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    status: {
      type: String,
      enum: ["Ativo", "Inativo"],
      default: "Ativo",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Jogador", jogadorSchema);