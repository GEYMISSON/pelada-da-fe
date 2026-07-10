const mongoose = require("mongoose");

async function conectarBanco() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("🟢 MongoDB conectado com sucesso!");
    } catch (erro) {
        console.error("🔴 Erro ao conectar no MongoDB");
        console.error(erro);
        process.exit(1);
    }
}

module.exports = conectarBanco;