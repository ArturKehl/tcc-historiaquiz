const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("UserAchievement", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aluno_id: { type: DataTypes.INTEGER, allowNull: false },
  conquista_id: { type: DataTypes.INTEGER, allowNull: false },
  data_desbloqueio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "aluno_conquistas", timestamps: false });
