const express = require("express");

const router =
    express.Router();

const partidaController =
    require("../controllers/partidaController");


// ============================================================
// PARTIDAS
// ============================================================


// Listar partidas
router.get(
    "/",
    partidaController.listar
);


// Buscar uma partida
router.get(
    "/:id",
    partidaController.buscar
);


// Criar partida
router.post(
    "/",
    partidaController.criar
);


// Excluir partida
router.delete(
    "/:id",
    partidaController.excluir
);


module.exports =
    router;