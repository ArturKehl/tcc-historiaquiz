const { Op } = require("sequelize");
const { User, ClassRoom, Quiz, Question, Attempt, Achievement, Score, UserAchievement } = require("../models");

function level(xp) {
  if (xp >= 5000) return { numero: 5, nome: "Mestre da História", proximo: null, atual: xp };
  if (xp >= 3000) return { numero: 4, nome: "Historiador", proximo: 5000, atual: xp };
  if (xp >= 1500) return { numero: 3, nome: "Estudante de História", proximo: 3000, atual: xp };
  if (xp >= 500) return { numero: 2, nome: "Aprendiz", proximo: 1500, atual: xp };
  return { numero: 1, nome: "Iniciante", proximo: 500, atual: xp };
}

exports.dashboard = async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: [{ model: ClassRoom, as: "turma" }] });
  const attempts = await Attempt.findAll({ where: { aluno_id: user.id } });
  const xp = attempts.reduce((s, a) => s + a.xp, 0);
  const points = attempts.reduce((s, a) => s + a.pontuacao, 0);
  const answered = attempts.reduce((s, a) => s + a.quantidade_acertos + a.quantidade_erros, 0);
  const correct = attempts.reduce((s, a) => s + a.quantidade_acertos, 0);
  const achievements = await UserAchievement.count({ where: { aluno_id: user.id } });

  const ranking = await User.findAll({
    where: { tipo_usuario: "ALUNO" },
    attributes: ["id", "nome"],
    include: [{ model: Attempt, as: "tentativas", attributes: ["pontuacao"] }]
  });
  const ordered = ranking.map(u => ({ id: u.id, nome: u.nome, pontos: u.tentativas.reduce((s,a)=>s+a.pontuacao,0) }))
    .sort((a,b)=>b.pontos-a.pontos);
  const pos = ordered.findIndex(x => x.id === user.id) + 1;

  res.json({
    usuario: { id: user.id, nome: user.nome, email: user.email, turma: user.turma?.nome || "Sem turma" },
    pontuacao: points,
    xp,
    nivel: level(xp),
    quizzes_realizados: attempts.length,
    perguntas_respondidas: answered,
    acertos: correct,
    erros: answered - correct,
    taxa_acerto: answered ? Math.round(correct / answered * 100) : 0,
    conquistas: achievements,
    posicao_ranking: pos || null
  });
};

exports.quizzes = async (req, res) => {
  const quizzes = await Quiz.findAll({
    where: { status: "PUBLICADO" },
    include: [{ model: Question, as: "perguntas", attributes: ["id", "enunciado", "alternativa_a", "alternativa_b", "alternativa_c", "alternativa_d", "tema", "dificuldade", "explicacao", "resposta_correta"] }]
  });
  res.json(quizzes);
};

exports.quiz = async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id, {
    include: [{ model: Question, as: "perguntas", attributes: ["id", "enunciado", "alternativa_a", "alternativa_b", "alternativa_c", "alternativa_d", "tema", "dificuldade", "explicacao", "resposta_correta"] }]
  });
  if (!quiz) return res.status(404).json({ erro: "Quiz não encontrado." });
  res.json(quiz);
};

exports.submitQuiz = async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id, { include: [{ model: Question, as: "perguntas" }] });
  if (!quiz) return res.status(404).json({ erro: "Quiz não encontrado." });

  const respostas = Array.isArray(req.body.respostas) ? req.body.respostas : [];
  const mapa = new Map(respostas.map(r => [Number(r.pergunta_id), r.resposta]));
  let acertos = 0;
  let streak = 0;
  let melhorStreak = 0;
  const detalhes = [];

  for (const q of quiz.perguntas) {
    const escolha = mapa.get(q.id);
    const correta = escolha === q.resposta_correta;
    if (correta) { acertos++; streak++; melhorStreak = Math.max(melhorStreak, streak); }
    else streak = 0;
    detalhes.push({ pergunta_id: q.id, escolha: escolha || null, correta, resposta_correta: q.resposta_correta, explicacao: q.explicacao, enunciado: q.enunciado });
  }

  const erros = quiz.perguntas.length - acertos;
  const bonusSequencia = melhorStreak >= 10 ? 250 : melhorStreak >= 5 ? 100 : melhorStreak >= 3 ? 50 : 0;
  const perfeito = erros === 0 && quiz.perguntas.length > 0;
  const pontos = acertos * 100 + bonusSequencia + (quiz.perguntas.length > 0 ? 200 : 0) + (perfeito ? 300 : 0);
  const xp = pontos;

  const attempt = await Attempt.create({ aluno_id: req.user.id, quiz_id: quiz.id, pontuacao: pontos, xp, quantidade_acertos: acertos, quantidade_erros: erros });
  const { Answer } = require("../models");
  for (const d of detalhes) {
    await Answer.create({ tentativa_id: attempt.id, pergunta_id: d.pergunta_id, resposta_escolhida: d.escolha || "A", correta: d.correta });
  }
  await Score.create({ aluno_id: req.user.id, pontos, xp });

  await verificarConquistas(req.user.id);

  res.json({ tentativa_id: attempt.id, pontos, xp, acertos, erros, melhor_sequencia: melhorStreak, perfeito, detalhes });
};

async function verificarConquistas(userId) {
  const { sequelize } = require("../models");
  const [stats] = await sequelize.query(`
    SELECT
      COALESCE(SUM(quantidade_acertos),0) acertos,
      COALESCE(MAX(quantidade_acertos),0) melhor_quiz,
      COUNT(*) quizzes
    FROM tentativas WHERE aluno_id = ${Number(userId)}
  `);
  const s = stats[0] || {};
  const all = await Achievement.findAll();
  for (const a of all) {
    let ok = false;
    if (a.nome === "Primeiro Passo") ok = Number(s.quizzes) >= 1;
    if (a.nome === "Historiador") ok = Number(s.acertos) >= 50;
    if (a.nome === "Mestre da História") ok = Number(s.acertos) >= 100;
    if (a.nome === "Perfeito") ok = Number(s.melhor_quiz) > 0 && Number(s.melhor_quiz) >= 1;
    if (a.nome === "Conhecimento Histórico") ok = Number(s.quizzes) >= 5;
    if (a.nome === "Imbatível") ok = Number(s.acertos) >= 10;
    if (a.nome === "Primeiro Quiz") ok = Number(s.quizzes) >= 1;
    if (a.nome === "50 Pontos") ok = true;
    if (a.nome === "1000 XP") {
      const [r] = await sequelize.query(`SELECT COALESCE(SUM(xp),0) xp FROM pontuacoes WHERE aluno_id = ${Number(userId)}`);
      ok = Number(r[0]?.xp || 0) >= 1000;
    }
    if (a.nome === "Explorador") ok = Number(s.quizzes) >= 3;
    if (ok) {
      await UserAchievement.findOrCreate({ where: { aluno_id: userId, conquista_id: a.id }, defaults: { aluno_id: userId, conquista_id: a.id } });
    }
  }
}

exports.achievements = async (req, res) => {
  const rows = await UserAchievement.findAll({
    where: { aluno_id: req.user.id },
    include: [{ model: Achievement, as: "conquistas" }]
  }).catch(async () => []);
  const all = await Achievement.findAll();
  const unlocked = await UserAchievement.findAll({ where: { aluno_id: req.user.id } });
  const set = new Set(unlocked.map(x => x.conquista_id));
  res.json(all.map(a => ({ ...a.toJSON(), desbloqueada: set.has(a.id) })));
};

exports.ranking = async (req, res) => {
  const users = await User.findAll({
    where: { tipo_usuario: "ALUNO" },
    include: [{ model: Attempt, as: "tentativas" }, { model: ClassRoom, as: "turma" }]
  });
  let data = users.map(u => {
    const pontos = u.tentativas.reduce((s,a)=>s+a.pontuacao,0);
    const xp = u.tentativas.reduce((s,a)=>s+a.xp,0);
    return { id:u.id, nome:u.nome, turma:u.turma?.nome || "Sem turma", pontos, xp, quizzes:u.tentativas.length, nivel:level(xp).nome };
  });
  if (req.query.turma_id) data = data.filter(x => String(x.turma) === String(req.query.turma_id));
  data.sort((a,b)=>b.pontos-a.pontos);
  res.json(data.map((x,i)=>({posicao:i+1,...x})));
};

exports.history = async (req, res) => {
  const rows = await Attempt.findAll({ where: { aluno_id: req.user.id }, include: [{ model: Quiz, as: "quiz", attributes: ["titulo","tema"] }], order: [["data_realizacao","DESC"]] });
  res.json(rows);
};
