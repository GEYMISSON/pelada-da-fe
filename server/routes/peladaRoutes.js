const express = require("express");

const router =
    express.Router();

const peladaController =
    require("../controllers/peladaController");


// Listar
router.get(
    "/",
    peladaController.listar
);


// Buscar por ID
router.get(
    "/:id",
    peladaController.buscar
);


// Criar
router.post(
    "/",
    peladaController.criar
);


// Atualizar
router.put(
    "/:id",
    peladaController.atualizar
);


// Excluir
router.delete(
    "/:id",
    peladaController.excluir
);


module.exports = router;