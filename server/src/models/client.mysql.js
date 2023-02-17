const Sequelize = require("sequelize");
const { sequelize } = require("../services/mysqlConnect");
const Trader = require("./trader.mysql");
const Client = sequelize.define(
  "Client",
  {
    trader: {
      type: Sequelize.INTEGER,
      ReferenceError: {
        module: Trader,
        key: "id",
      },
      require: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "trader ID is required",
        },
      },
    },
    name: {
      type: Sequelize.STRING,
      require: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Name is required",
        },
      },
    },
    email: {
      type: Sequelize.STRING,
      require: true,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        notNull: {
          args: true,
          msg: "Email is required",
        },
      },
    },

    city: {
      type: Sequelize.STRING,
      require: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "City  is required",
        },
        len: {
          args: [3, 50],
          msg: "City must be with details, between 3 and 50 characters long ",
        },
      },
    },
    address: {
      type: Sequelize.TEXT,
      require: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Address  is required",
        },
        len: {
          args: [10, 200],
          msg: "address must be with details, between 10 and 200 characters long ",
        },
      },
    },
    filepath: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: true,
  }
);

Client.belongsTo(Trader, { targetKey: "id", foreignKey: "trader" });
sequelize.sync();
module.exports = Client;
