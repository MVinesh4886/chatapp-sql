const Sequelize = require("sequelize");
const db = require("../config/database");
const { DataTypes } = Sequelize;

const oldMessage = db.define("oldMessage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = oldMessage;
