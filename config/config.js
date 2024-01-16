const Sequelize = require('sequelize');
const config = require("./development");
const sequelize = new Sequelize(config.development);

module.exports = sequelize;
