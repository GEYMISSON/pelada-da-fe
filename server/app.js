const express = require("express");
const cors = require("cors");
const path = require("path");

const jogadorRoutes = require("./routes/jogadorRoutes");

const app = express();

app.use(cors());

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    limit: "10mb",
    extended: true
}));

app.use("/api/jogadores", jogadorRoutes);

// Servir arquivos estáticos da pasta client
app.use(express.static(path.join(__dirname, "../client")));

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

module.exports = app;