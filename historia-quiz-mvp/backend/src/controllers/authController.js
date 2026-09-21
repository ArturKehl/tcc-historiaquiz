const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

function token(user) {
  return jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, tipo_usuario: user.tipo_usuario },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, turma_id } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
    if (senha.length < 6) return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });

    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(409).json({ erro: "E-mail já cadastrado." });

    const hash = await bcrypt.hash(senha, 10);
    const user = await User.create({ nome, email, senha: hash, turma_id: turma_id || null, tipo_usuario: "ALUNO" });
    res.status(201).json({ id: user.id, token: token(user), usuario: { id: user.id, nome: user.nome, email: user.email, tipo_usuario: user.tipo_usuario } });
  } catch (e) {
    res.status(500).json({ erro: "Erro ao cadastrar usuário.", detalhe: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(senha || "", user.senha))) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }
    res.json({ token: token(user), usuario: { id: user.id, nome: user.nome, email: user.email, tipo_usuario: user.tipo_usuario, turma_id: user.turma_id } });
  } catch (e) {
    res.status(500).json({ erro: "Erro no login.", detalhe: e.message });
  }
};
