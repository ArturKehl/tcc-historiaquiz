const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("QuizQuestion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quiz_id: { type: DataTypes.INTEGER, allowNull: false },
  pergunta_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: "quiz_perguntas", timestamps: false });
