const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Score", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aluno_id: { type: DataTypes.INTEGER, allowNull: false },
  pontos: { type: DataTypes.INTEGER, defaultValue: 0 },
  xp: { type: DataTypes.INTEGER, defaultValue: 0 },
  data: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "pontuacoes", timestamps: false });
