const Sequelize = require("sequelize");
const { sequelize } = require("../services/mysqlConnect");
const Trader = require("./trader.mysql");
const Product = require("./product.mysql");
const Client = require("./client.mysql");

const Order = sequelize.define("Order", {
  trader: {
    type: Sequelize.INTEGER,
    require: true,
    allowNull: false,
    references: {
      module: Trader,
      key: "id",
    },
    validate: {
      notNull: {
        args: true,
        msg: "Trader is required",
      },
    },
  },
  product: {
    type: Sequelize.INTEGER,
    require: true,
    allowNull: false,
    references: {
      module: Product,
      key: "id",
    },
    validate: {
      notNull: {
        args: true,
        msg: "Procut is required",
      },
    },
  },
  client: {
    type: Sequelize.INTEGER,
    require: true,
    allowNull: false,
    references: {
      module: Client,
      key: "id",
    },
    validate: {
      notNull: {
        args: true,
        msg: "Client is required",
      },
    },
  },
  quantity: {
    type: Sequelize.INTEGER,
    require: true,
    allowNull: false,
    validate: {
      notNull: {
        args: true,
        msg: "Quantity is required",
      },
    },
  },
});

Order.belongsTo(Trader, { targetKey: "id", foreignKey: "trader" });
Order.belongsTo(Product, { targetKey: "id", foreignKey: "product" });
Order.belongsTo(Client, { targetKey: "id", foreignKey: "client" });

sequelize.sync();

module.exports = Order;
