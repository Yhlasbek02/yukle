const Sequelize = require('sequelize');

const sequelize = new Sequelize('latest_yukle', 'postgres', '0104', {
  dialect: 'postgres',
  host: 'localhost',
  
});

module.exports = sequelize;
