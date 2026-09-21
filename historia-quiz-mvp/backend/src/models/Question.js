const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Question", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  enunciado: { type: DataTypes.TEXT, allowNull: false },
  alternativa_a: { type: DataTypes.STRING(500), allowNull: false },
  alternativa_b: { type: DataTypes.STRING(500), allowNull: false },
  alternativa_c: { type: DataTypes.STRING(500), allowNull: false },
  alternativa_d: { type: DataTypes.STRING(500), allowNull: false },
  resposta_correta: { type: DataTypes.ENUM("A", "B", "C", "D"), allowNull: false },
  explicacao: { type: DataTypes.TEXT, allowNull: false },
  tema: { type: DataTypes.STRING(100), allowNull: false },
  dificuldade: { type: DataTypes.ENUM("FACIL", "MEDIO", "DIFICIL"), defaultValue: "MEDIO" },
  professor_id: { type: DataTypes.INTEGER, allowNull: false },
  data_criacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "perguntas", timestamps: false });
