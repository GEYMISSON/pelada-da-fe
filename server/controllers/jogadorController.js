const jogadorService = require("../services/jogadorService");

exports.listar = async (req, res) => {
  try {
    const jogadores = await jogadorService.listar();
    res.json(jogadores);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const jogador = await jogadorService.criar(req.body);
    res.status(201).json(jogador);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const jogador = await jogadorService.atualizar(req.params.id, req.body);
    res.json(jogador);
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
};

exports.excluir = async (req, res) => {
  try {
    await jogadorService.excluir(req.params.id);
    res.json({
      sucesso: true,
      mensagem: "Jogador removido com sucesso.",
    });
  } catch (erro) {
    res.status(400).json({ erro: erro.message });
  }
};