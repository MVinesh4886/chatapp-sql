const Sequelize = require("sequelize");
const db = require("../config/database");
const { DataTypes } = Sequelize;

const Group = db.define("group", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

module.exports = Group;
