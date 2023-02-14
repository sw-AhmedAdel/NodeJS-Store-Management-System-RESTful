const Sequelize = require("sequelize");
const { sequelize } = require("../services/mysqlConnect");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Trader = sequelize.define(
  "Trader",
  {
    name: {
      type: Sequelize.STRING,
      require: true,
      allowNull: false,
      validate: {
        len: {
          args: [5, 50],
          msg: "Name must be between 5 and 50 characters long",
        },
        notNull: {
          args: true,
          msg: "Name is required",
        },
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      require: true,
      unique: true,
      validate: {
        isEmail: true,
      },
      notNull: {
        args: true,
        msg: "Email is required",
      },
    },
    role: {
      type: Sequelize.ENUM,
      values: ["trader", "admin"],
      allowNull: false,
      defaultValue: "trader",
      validate: {
        isIn: {
          args: [["trader", "admin"]],
          msg: "Invalid role value. Allowed values are: trader, admin",
        },
      },
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: Sequelize.STRING,
      require: true,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: "Password is required",
        },
        len: {
          //args: [8, 100],  msg: "Password must be between 8 and 50 characters long",
          min: 8,
          msg: "Password must be between equal or greater than 8  characters long",
        },
      },
    },
    passwordConfirm: {
      type: Sequelize.STRING,
      required: true,
      allowNull: true,
      validate: {
        /*
        In short, the custom validator function defined in the passwordConfirm field is 
        triggered whenever the user model instance is being saved to the database, 
        whether it's a new user creation or an update to an existing user's password. 
        */
        customValidator(value) {
          if (!value) {
            throw new Error("Password confirm is required");
          }
          if (value !== this.password) {
            throw new Error("Password and password confirm do not match");
          }
        },
      },
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    verified_reset_token: Sequelize.STRING,
    password_reset_token: Sequelize.STRING,
    password_reset_expires: Sequelize.DATE,
    verifiedDate: Sequelize.DATE,
  },
  {
    timestamps: true,
  }
);

Trader.beforeSave(async (trader) => {
  if (!trader.changed("password")) return;
  trader.password = await bcrypt.hash(trader.password, 12);
});
/*
Trader.beforeUpdate(async (trader) => {
  if (!trader.changed("password")) return;

  trader.password = await bcrypt.hash(trader.password, 12);
  trader.passwordConfirm = undefined;
});
*/

Trader.prototype.toJSON = function () {
  const trader = this;
  const values = Object.assign({}, trader.get());
  delete values.password;
  delete values.passwordConfirm;
  delete values.password_changed_at;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  delete values.verified_reset_token;
  delete values.isVerified;
  delete values.role;
  return values;
};

// Use prototype to add function on each instance of the Trader model.
Trader.prototype.generateAuthToken = function () {
  const trader = this;
  const token = jwt.sign({ _id: trader.id }, process.env.SECRET_JWT, {
    expiresIn: process.env.EXPIRES_IN,
  });
  return token;
};

// Ass function to the model
Trader.findByCredentials = async function (email, password) {
  const trader = await Trader.findOne({ where: { email } });

  if (!trader) {
    return false;
  }
  const isMatch = await bcrypt.compare(password, trader.password);
  if (!isMatch) {
    return false;
  }
  return trader;
};

Trader.prototype.createVerifiedResetToken = async function () {
  const trader = this;
  const verifyToken = crypto.randomBytes(32).toString("hex");

  trader.verified_reset_token = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  await trader.save();
  return verifyToken;
};

Trader.prototype.createPasswordResetToken = async function () {
  const trader = this;
  const resetToken = crypto.randomBytes(32).toString("hex");

  trader.password_reset_token = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  trader.password_reset_expires = Date.now() + 10 * 60 * 1000;
  await trader.save();
  return resetToken;
};

Trader.prototype.comparePassword = async function (
  candidatePassword,
  traderPassword
) {
  return await bcrypt.compare(candidatePassword, traderPassword);
};

module.exports = Trader;
