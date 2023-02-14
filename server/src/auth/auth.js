const appError = require("../services/ClassErrMiddleware");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { FindTrader } = require("../models/tader.model");

//  authentication
async function auth(req, res, next) {
  let token;
  if (req.signedCookies.token) {
    token = req.signedCookies.token;
  }
  if (!token) {
    return next(new appError("Please signup or login in to get access", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_JWT);
  const trader = await FindTrader({ id: decoded._id });
  if (!trader) {
    return next(new appError("User is not longer exits", 401));
  }

  req.trader = trader;
  next();
}

// The code below is for authorization but the task does not require authorization
const restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.trader.role)) {
      return next(
        new appError("You dont have premession to do that action!", 403)
      );
    }
    next();
  };
};

module.exports = {
  auth,
  restrictedTo,
};
