const Sequelize = require("sequelize");
const { FindTrader } = require("../models/tader.model");
const appError = require("../services/ClassErrMiddleware");
const Email = require("../services/email");
const crypto = require("crypto");
const sendCookieToRespond = require("../auth/cookies");

async function httpForgotPassword(req, res, next) {
  if (!req.body.email) {
    return next(new appError("Please provide ur email", 401));
  }
  const trader = await FindTrader({
    email: req.body.email,
  });
  if (!trader) {
    return next(new appError("User is not exits", 401));
  }

  const resetToken = await trader.createPasswordResetToken();
  //prepare the link what will have the token and send it to the user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/v1/traders/resetPassword/${resetToken}`;

  try {
    await new Email(trader, resetURL).sendPasswordreset();
    return res.status(200).json({
      status: "success",
      message: "token send to email",
    });
  } catch (err) {
    (trader.passwordResetToken = undefined),
      (trader.passwordResetTokenExpiresIn = undefined);
    await trader.save();
    return next(new appError("there was an error please try again", 500));
  }
}

async function httpReserPassword(req, res, next) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const trader = await FindTrader({
    password_reset_token: hashedToken,
    password_reset_expires: { [Sequelize.Op.gt]: Date.now() },
  });

  if (!trader) {
    return next(
      new appError("Invalid token or expired, please try again", 401)
    );
  }

  trader.password = req.body.password;
  trader.passwordConfirm = req.body.passwordConfirm;
  trader.password_reset_token = null;
  trader.password_reset_expires = null;
  await trader.save();

  sendCookieToRespond(trader, res);
  return res.status(200).json({
    status: "success reset password",
  });
}

async function httpUpdateCurrentPassword(req, res, next) {
  const trader = req.trader;

  const isMatch = await trader.comparePassword(
    req.body.currentpassword,
    trader.password
  );
  if (!isMatch) {
    return next(new appError("Your current password is wrong", 401));
  }

  trader.password = req.body.newpassword;
  trader.passwordConfirm = req.body.passwordConfirm;
  await trader.save();
  sendCookieToRespond(trader, res);

  return res.status(200).json({
    status: "password has been changed",
  });
}

module.exports = {
  httpForgotPassword,
  httpReserPassword,
  httpUpdateCurrentPassword,
};
