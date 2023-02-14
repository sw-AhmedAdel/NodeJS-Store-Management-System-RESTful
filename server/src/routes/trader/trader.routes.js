const express = require("express");
const traderRoute = express.Router();
const {
  httpgetAllTrader,
  httpSignUpNewTrader,
  httpMyProfile,
  httpUpdateTrader,
  httpDeleteTrader,
  httpLogin,
  httpLogout,
  httpVerifyAccount,
  httpScheduleNotificationToClients,
  httpGetOrdersReportsThroughoutDay,
  httpSendVerifyTokenWhenSignDontSendToken,
} = require("./trader.controller");

const { catchAsync } = require("../../services/GlobalHandelMiddleware");
const { auth, restrictedTo } = require("../../auth/auth");

const {
  httpForgotPassword,
  httpReserPassword,
  httpUpdateCurrentPassword,
} = require("../../password/password");

traderRoute.post("/sign", catchAsync(httpSignUpNewTrader));
traderRoute.post("/verify/account/:token", catchAsync(httpVerifyAccount));
traderRoute.post("/login", catchAsync(httpLogin));
traderRoute.post("/forgotpassword", catchAsync(httpForgotPassword));
traderRoute.patch("/resetpassword/:token", catchAsync(httpReserPassword));
traderRoute.post(
  "/send/verify/email",
  catchAsync(httpSendVerifyTokenWhenSignDontSendToken)
);
traderRoute.use(catchAsync(auth));
traderRoute.patch("/updatepassword", catchAsync(httpUpdateCurrentPassword));
traderRoute.get("/myprofile", catchAsync(httpMyProfile));
traderRoute.patch("/", catchAsync(httpUpdateTrader));
traderRoute.delete("/", catchAsync(httpDeleteTrader));
traderRoute.get("/logout", httpLogout);
traderRoute.post(
  "/schedule-notification/:id",
  catchAsync(httpScheduleNotificationToClients)
);
traderRoute.get("/daily-report", catchAsync(httpGetOrdersReportsThroughoutDay));

traderRoute.use(restrictedTo("admin"));
traderRoute.get("/", catchAsync(httpgetAllTrader));

module.exports = traderRoute;
