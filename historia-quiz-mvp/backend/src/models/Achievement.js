const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Achievement", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  descricao: { type: DataTypes.STRING(255), allowNull: false },
  requisito: { type: DataTypes.STRING(120), allowNull: false },
  icone: { type: DataTypes.STRING(20), defaultValue: "🏆" }
}, { tableName: "conquistas", timestamps: false });
