const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  senha: { type: DataTypes.STRING(255), allowNull: false },
  tipo_usuario: { type: DataTypes.ENUM("ALUNO", "PROFESSOR"), defaultValue: "ALUNO" },
  turma_id: { type: DataTypes.INTEGER, allowNull: true },
  data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: "usuarios", timestamps: false });
