const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DILACT,
    logging: false,
  }
);

async function mysqlConnect() {
  await sequelize.authenticate();
}

async function mysqlCloseConnection() {
  await sequelize.close();
}

module.exports = {
  mysqlConnect,
  sequelize,
};
