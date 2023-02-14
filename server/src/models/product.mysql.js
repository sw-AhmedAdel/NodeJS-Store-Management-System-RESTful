const Sequelize = require("sequelize");
const { sequelize } = require("../services/mysqlConnect");
const Trader = require("./trader.mysql");

const Product = sequelize.define(
  "Product",
  {
    trader: {
      type: Sequelize.INTEGER,
      references: {
        model: Trader,
        key: "id",
      },
      required: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Product ID is required",
        },
      },
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      required: true, // field must have a value before save it in the database
      validate: {
        len: {
          args: [5, 50],
          msg: "Name must be between 5 and 50 characters long",
        },
        notNull: {
          args: true,
          msg: "Product name is required",
        },
      },
    },

    quantity: {
      type: Sequelize.INTEGER,
      required: true,
      defaultValue: 0,
      allowNull: false,
      validate: {
        customValidator(value) {
          if (value < 0) {
            throw new Error("Quantity can not ne less than 0");
          }
        },
      },
    },

    price: {
      type: Sequelize.DECIMAL,
      required: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Price name is required",
        },
        customValidator(value) {
          if (value <= 0) {
            throw new Error("Price can not be less than 0");
          }
        },
      },
    },
    priceDiscount: {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
      validate: {
        customValidator(value) {
          if (value > this.price) {
            throw new Error("price Discount can not be less than price");
          }
        },
      },
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      required: true,
      validate: {
        notNull: {
          args: true,
          msg: "Description name is required",
        },
        len: {
          args: [5, 100],
          msg: "description must be between 5 and 100 characters long ",
        },
      },
    },
    category: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Category name is required",
        },
        len: {
          args: [2, 50],
          msg: "category must be between 3 and 50 characters long ",
        },
      },
    },
    company: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Company name is required",
        },
        len: {
          args: [2, 100],
          msg: "Company must be between 3 and 100 characters long ",
        },
      },
    },

    numberOfReviews: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ratingQuantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ratingsAverage: {
      type: Sequelize.FLOAT,
      defaultValue: 1,
      validate: {
        customValidator(value) {
          if (value < 1 || value > 5) {
            throw new Error("Rating average must be between 1 and 5");
          }
          let roundedVal = Math.round(value * 10) / 10;
          if (roundedVal >= 1 && roundedVal <= 5) {
            this.setDataValue("ratingsAverage", roundedVal);
          }
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

//It provides clarity and helps to ensure that the correct primary key is referenced in the foreign key relationship.
// target id which id in the Trader and foreignKey will be the primary key in the Trader

Product.belongsTo(Trader, { targetKey: "id", foreignKey: "trader" });
sequelize.sync({ force: false });
module.exports = Product;
