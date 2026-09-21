const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("Answer", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tentativa_id: { type: DataTypes.INTEGER, allowNull: false },
  pergunta_id: { type: DataTypes.INTEGER, allowNull: false },
  resposta_escolhida: { type: DataTypes.ENUM("A", "B", "C", "D"), allowNull: false },
  correta: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: "respostas", timestamps: false });
