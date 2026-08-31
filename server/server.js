require("dotenv").config();

const app = require("./app");
const conectarBanco = require("./config/database");

const PORT = process.env.PORT || 3000;

conectarBanco();

//app.listen(PORT, () => {
app.listen(PORT, "0.0.0.0", () => {

    console.log(`🚀 Servidor iniciado`);
    console.log(`⚽ Pelada da Fé`);
    console.log(`🌎 http://localhost:${PORT}`);

});