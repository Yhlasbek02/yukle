const Sequelize = require('sequelize');

const sequelize = new Sequelize('yukle', 'postgres', '0104', {
  dialect: 'postgres',
  host: 'localhost',
});

module.exports = sequelize;
