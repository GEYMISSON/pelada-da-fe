const Jogador = require("../models/Jogador");

async function listar() {
  return await Jogador.find().sort({ nome: 1 });
}

async function criar(dados) {
  return await Jogador.create(dados);
}

async function buscarPorId(id) {
  return await Jogador.findById(id);
}

async function atualizar(id, dados) {
  return await Jogador.findByIdAndUpdate(id, dados, {
    returnDocument: "after",
    runValidators: true,
  });
}

async function excluir(id) {
  return await Jogador.findByIdAndDelete(id);
}

module.exports = {
  listar,
  criar,
  buscarPorId,
  atualizar,
  excluir,
};