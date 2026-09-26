const express = require("express");
const cors = require("cors");
const path = require("path");

const jogadorRoutes =
    require("./routes/jogadorRoutes");

const partidaRoutes =
    require("./routes/partidaRoutes");

const golRoutes = 
    require("./routes/golRoutes");


const app =
    express();


// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors());


app.use(
    express.json({
        limit: "10mb"
    })
);


app.use(
    express.urlencoded({
        limit: "10mb",
        extended: true
    })
);


// ============================================================
// ROTAS DA API
// ============================================================

app.use(
    "/api/jogadores",
    jogadorRoutes
);


app.use(
    "/api/partidas",
    partidaRoutes
);

app.use(
    "/api/gols", 
    golRoutes);


// ============================================================
// ARQUIVOS DO CLIENTE
// ============================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../client"
        )
    )
);


// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../client/index.html"
            )
        );

    }
);


// ============================================================
// EXPORTAR
// ============================================================

module.exports =
    app;