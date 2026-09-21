const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Attempt", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aluno_id: { type: DataTypes.INTEGER, allowNull: false },
  quiz_id: { type: DataTypes.INTEGER, allowNull: false },
  pontuacao: { type: DataTypes.INTEGER, defaultValue: 0 },
  xp: { type: DataTypes.INTEGER, defaultValue: 0 },
  quantidade_acertos: { type: DataTypes.INTEGER, defaultValue: 0 },
  quantidade_erros: { type: DataTypes.INTEGER, defaultValue: 0 },
  data_realizacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "tentativas", timestamps: false });
