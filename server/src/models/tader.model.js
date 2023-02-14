const Sequelize = require("sequelize");
const Trader = require("./trader.mysql");
const Product = require("./product.mysql");
const Order = require("./order.mysql");
const Client = require("./client.mysql");

const {
  getDateDuring24Hour,
  getObjProductAndQuantity,
  getProductsReport,
} = require("../services/servicesFunction");
async function findByCredentials(email, password) {
  return await Trader.findByCredentials(email, password);
}

async function getAllTrader() {
  const traders = await Trader.findAll();
  return traders;
}

async function SignUpNewTrader(trader) {
  const newTrader = await Trader.create(trader);
  return newTrader;
}

async function FindTrader(filter) {
  //const trader = await Trader.findByPk(id);
  const trader = await Trader.findOne({
    where: filter,
  });

  return trader;
}

async function UpdateTrader(newData, trader) {
  /*const updatedTrader = await Trader.update(trader, {
    where: { id: id },
    returning: true, //return the updated instances.
  });
  return updatedTrader[1]; //this is array containing two elements: the number of rows affected and an array of the updated instances
 */
  await trader.update(newData);
  return trader.dataValues;
}

async function GetOrdersReportsThroughoutDay(trader) {
  const { startOfDay, endOfDay } = getDateDuring24Hour();
  const orders = await Order.findAll({
    where: {
      trader: trader.id,
      createdAt: {
        [Sequelize.Op.between]: [startOfDay, endOfDay],
      },
    },
    include: [
      {
        model: Product,
        attributes: ["name", "price"],
      },
      {
        model: Client,
        attributes: ["name"],
      },
    ],
    attributes: {
      exclude: ["id", "trader", "product", "client", "createdAt", "updatedAt"],
    },
  });

  const { products, totalSales } = getObjProductAndQuantity(orders);
  const { productReport } = getProductsReport(products);
  return {
    orders,
    productReport,
    totalSales,
  };
}

module.exports = {
  getAllTrader,
  SignUpNewTrader,
  FindTrader,
  UpdateTrader,
  findByCredentials,
  GetOrdersReportsThroughoutDay,
};
