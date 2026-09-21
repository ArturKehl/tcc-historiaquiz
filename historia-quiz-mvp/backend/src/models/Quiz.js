const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Quiz", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(150), allowNull: false },
  descricao: { type: DataTypes.TEXT },
  tema: { type: DataTypes.STRING(100), allowNull: false },
  dificuldade: { type: DataTypes.ENUM("FACIL", "MEDIO", "DIFICIL"), defaultValue: "MEDIO" },
  professor_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("RASCUNHO", "PUBLICADO"), defaultValue: "PUBLICADO" }
}, { tableName: "quizzes" });
