const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("ClassRoom", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(80), allowNull: false },
  professor_id: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: "turmas", timestamps: true });
