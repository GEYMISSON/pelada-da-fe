const express = require("express");

const router = express.Router();

const golController = require("../controllers/golController");


// ============================================================
// ROTAS DE GOLS
// ============================================================

// Listar todos os gols
router.get(
    "/",
    golController.listar
);


// Criar novo gol
router.post(
    "/",
    golController.criar
);


// Listar gols de uma partida específica
// IMPORTANTE: deve ficar antes de /:id
router.get(
    "/partida/:partidaId",
    golController.listarPorPartida
);


// Buscar gol por ID
router.get(
    "/:id",
    golController.buscar
);


// Excluir gol
router.delete(
    "/:id",
    golController.excluir
);


module.exports = router;