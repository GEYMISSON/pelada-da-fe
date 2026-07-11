const express = require("express");
const router = express.Router();

const jogadorController = require("../controllers/jogadorController");

router.get("/", jogadorController.listar);

router.post("/", jogadorController.criar);

router.put("/:id", jogadorController.atualizar);

router.delete("/:id", jogadorController.excluir);

module.exports = router;