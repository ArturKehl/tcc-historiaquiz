const { Op } = require("sequelize");
const { User, ClassRoom, Question, Quiz, Attempt } = require("../models");

exports.dashboard = async (req,res) => {
  const alunos = await User.count({ where:{ tipo_usuario:"ALUNO" } });
  const quizzes = await Quiz.count({ where:{ professor_id:req.user.id } });
  const attempts = await Attempt.findAll({ include:[{model:Quiz,as:"quiz",where:{professor_id:req.user.id},attributes:[]}], attributes:["pontuacao","quantidade_acertos","quantidade_erros"] });
  const totalQ = attempts.reduce((s,a)=>s+a.quantidade_acertos+a.quantidade_erros,0);
  const totalA = attempts.reduce((s,a)=>s+a.quantidade_acertos,0);
  res.json({
    alunos,
    quizzes,
    media_acertos: totalQ ? Math.round(totalA/totalQ*100) : 0,
    media_pontuacao: attempts.length ? Math.round(attempts.reduce((s,a)=>s+a.pontuacao,0)/attempts.length) : 0
  });
};

exports.questions = async (req,res) => {
  const rows = await Question.findAll({ where:{ professor_id:req.user.id }, order:[["id","DESC"]] });
  res.json(rows);
};

exports.createQuestion = async (req,res) => {
  const data = {...req.body, professor_id:req.user.id};
  const q = await Question.create(data);
  res.status(201).json(q);
};

exports.updateQuestion = async (req,res) => {
  const q = await Question.findOne({where:{id:req.params.id,professor_id:req.user.id}});
  if(!q) return res.status(404).json({erro:"Questão não encontrada."});
  await q.update(req.body);
  res.json(q);
};

exports.deleteQuestion = async (req,res) => {
  const q = await Question.findOne({where:{id:req.params.id,professor_id:req.user.id}});
  if(!q) return res.status(404).json({erro:"Questão não encontrada."});
  await q.destroy();
  res.json({mensagem:"Questão excluída."});
};

exports.quizzes = async (req,res) => {
  const rows = await Quiz.findAll({where:{professor_id:req.user.id},include:["perguntas"],order:[["id","DESC"]]});
  res.json(rows);
};

exports.createQuiz = async (req,res) => {
  const {titulo,descricao,tema,dificuldade,status,perguntas=[]}=req.body;
  const qz=await Quiz.create({titulo,descricao,tema,dificuldade,status:status||"RASCUNHO",professor_id:req.user.id});
  if(Array.isArray(perguntas)) await qz.setPerguntas(perguntas.map(Number).filter(Boolean));
  res.status(201).json(await Quiz.findByPk(qz.id,{include:["perguntas"]}));
};

exports.updateQuiz = async (req,res) => {
  const qz=await Quiz.findOne({where:{id:req.params.id,professor_id:req.user.id}});
  if(!qz) return res.status(404).json({erro:"Quiz não encontrado."});
  const {perguntas,...data}=req.body;
  await qz.update(data);
  if(Array.isArray(perguntas)) await qz.setPerguntas(perguntas.map(Number).filter(Boolean));
  res.json(await Quiz.findByPk(qz.id,{include:["perguntas"]}));
};

exports.deleteQuiz = async (req,res) => {
  const qz=await Quiz.findOne({where:{id:req.params.id,professor_id:req.user.id}});
  if(!qz) return res.status(404).json({erro:"Quiz não encontrado."});
  await qz.destroy();
  res.json({mensagem:"Quiz excluído."});
};

exports.students = async (req,res) => {
  const rows=await User.findAll({where:{tipo_usuario:"ALUNO"},include:[{model:ClassRoom,as:"turma"},{model:Attempt,as:"tentativas"}]});
  res.json(rows.map(u=>{
    const tent=u.tentativas||[];
    const pontos=tent.reduce((s,a)=>s+a.pontuacao,0), xp=tent.reduce((s,a)=>s+a.xp,0), resp=tent.reduce((s,a)=>s+a.quantidade_acertos+a.quantidade_erros,0), ac=tent.reduce((s,a)=>s+a.quantidade_acertos,0);
    return {id:u.id,nome:u.nome,email:u.email,turma:u.turma?.nome||"Sem turma",pontuacao:pontos,xp,quizzes:tent.length,acertos:ac,erros:resp-ac,taxa:resp?Math.round(ac/resp*100):0};
  }));
};

exports.classes = async (req,res) => res.json(await ClassRoom.findAll({where:{professor_id:req.user.id},include:[{model:User,as:"alunos",attributes:["id","nome","email"]}]}));
