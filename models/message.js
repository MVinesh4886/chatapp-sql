const Sequelize = require("sequelize");
const db = require("../config/database");
const { DataTypes } = Sequelize;

const Message = db.define("Message", {
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

module.exports = Message;
