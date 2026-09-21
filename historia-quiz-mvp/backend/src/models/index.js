const sequelize = require("../config/database");
const User = require("./User");
const ClassRoom = require("./ClassRoom");
const Question = require("./Question");
const Quiz = require("./Quiz");
const QuizQuestion = require("./QuizQuestion");
const Attempt = require("./Attempt");
const Answer = require("./Answer");
const Achievement = require("./Achievement");
const UserAchievement = require("./UserAchievement");
const Score = require("./Score");

User.belongsTo(ClassRoom, { foreignKey: "turma_id", as: "turma" });
ClassRoom.hasMany(User, { foreignKey: "turma_id", as: "alunos" });

ClassRoom.belongsTo(User, { foreignKey: "professor_id", as: "professor" });
User.hasMany(ClassRoom, { foreignKey: "professor_id", as: "turmas" });

Question.belongsTo(User, { foreignKey: "professor_id", as: "professor" });
User.hasMany(Question, { foreignKey: "professor_id", as: "questoes" });

Quiz.belongsTo(User, { foreignKey: "professor_id", as: "professor" });
User.hasMany(Quiz, { foreignKey: "professor_id", as: "quizzes" });

Quiz.belongsToMany(Question, { through: QuizQuestion, foreignKey: "quiz_id", otherKey: "pergunta_id", as: "perguntas" });
Question.belongsToMany(Quiz, { through: QuizQuestion, foreignKey: "pergunta_id", otherKey: "quiz_id", as: "quizzes" });

Attempt.belongsTo(User, { foreignKey: "aluno_id", as: "aluno" });
Attempt.belongsTo(Quiz, { foreignKey: "quiz_id", as: "quiz" });
User.hasMany(Attempt, { foreignKey: "aluno_id", as: "tentativas" });
Quiz.hasMany(Attempt, { foreignKey: "quiz_id", as: "tentativas" });

Answer.belongsTo(Attempt, { foreignKey: "tentativa_id", as: "tentativa" });
Answer.belongsTo(Question, { foreignKey: "pergunta_id", as: "pergunta" });
Attempt.hasMany(Answer, { foreignKey: "tentativa_id", as: "respostas" });

User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: "aluno_id", otherKey: "conquista_id", as: "conquistas" });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: "conquista_id", otherKey: "aluno_id", as: "alunos" });

Score.belongsTo(User, { foreignKey: "aluno_id", as: "aluno" });
User.hasMany(Score, { foreignKey: "aluno_id", as: "pontuacoes" });

module.exports = {
  sequelize, User, ClassRoom, Question, Quiz, QuizQuestion,
  Attempt, Answer, Achievement, UserAchievement, Score
};
