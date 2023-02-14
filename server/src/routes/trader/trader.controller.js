const schedule = require("node-schedule");
const appError = require("../../services/ClassErrMiddleware");
const email = require("../../services/email");
const crypto = require("crypto");
const { FindClient } = require("../../models/client.model");
const sendCookieToRespond = require("../../auth/cookies");

const {
  getAllTrader,
  SignUpNewTrader,
  FindTrader,
  UpdateTrader,
  findByCredentials,
  GetOrdersReportsThroughoutDay,
} = require("../../models/tader.model");

const {
  filterObject,
  scheduleNotificationToClients,
  getRequestData,
} = require("../../services/servicesFunction");

async function httpSignUpNewTrader(req, res, next) {
  const { name, email, password, passwordConfirm } = req.body;
  const trader = {
    name,
    email,
    password,
    passwordConfirm,
  };
  const newTrader = await SignUpNewTrader(trader);
  const verifyToken = await newTrader.createVerifiedResetToken();

  const url = `${req.protocol}://${req.get(
    "host"
  )}/v1/trader/verifyemail/${verifyToken}`;

  try {
    await new email(newTrader, url).verificationToken();
    return res.status(201).json({
      message: "Please check your email to verify your account",
    });
  } catch (err) {
    return res.status(201).json({
      message: "Could not send verify email",
    });
  }
}

async function httpSendVerifyTokenWhenSignDontSendToken(req, res, next) {
  if (!req.body.email) {
    return new next(new appError("Please provide your email", 400));
  }
  const { email } = req.body;
  const trader = await FindTrader({
    email,
  });

  if (!trader) {
    return new next(new appError("Email is not exits", 400));
  }
  if (trader.isVerified) {
    return new next(
      new appError("Your account has been Verified, please login", 400)
    );
  }

  const verifyToken = await trader.createVerifiedResetToken();
  const url = `${req.protocol}://${req.get(
    "host"
  )}/v1/trader/verifyemail/${verifyToken}`;

  try {
    await new email(trader, url).verificationToken();
    return res.status(201).json({
      message: "Please check your email to verify your account",
    });
  } catch (err) {
    return res.status(201).json({
      message: "Could not send verify email, please try again later",
    });
  }
}

async function httpVerifyAccount(req, res, next) {
  const verifyToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const trader = await FindTrader({
    verified_reset_token: verifyToken,
  });

  if (!trader) {
    return next(
      new appError("Invalid token, Email has been sent, Check you emails", 401)
    );
  }
  trader.isVerified = true;
  trader.active = true;
  trader.verified_reset_token = null;
  trader.verifiedDate = Date.now();
  await trader.save();
  return res.status(201).json({
    message: "Please login using your emai and password",
  });
}

async function httpLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError("please provide email and password", 400));
  }
  const trader = await findByCredentials(email, password);

  if (!trader) {
    return next(new appError("unable to login ", 400));
  }

  if (!trader.isVerified) {
    return next(
      new appError("Please check your email to verify your account", 401)
    );
  }
  sendCookieToRespond(trader, res);
  return res.status(201).json({
    trader,
  });
}

function httpLogout(req, res) {
  res.cookie("token", "Logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  if (process.env.NODE_ENV === "development") {
    return res.status(200).json({
      status: "success",
      messae: "You loged out",
    });
  } else {
    return res.status(200).json();
  }
}

async function httpgetAllTrader(req, res, next) {
  const traders = await getAllTrader();
  return res.status(200).json({
    status: "success",
    results: traders.length,
    data: traders,
  });
}

async function httpMyProfile(req, res, next) {
  return res.status(200).json({
    trader: req.trader,
  });
}

async function httpUpdateTrader(req, res, next) {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError("Can not update password and password confirm"));
  }
  let trader = req.trader;
  newData = filterObject(req.body, "name", "email");
  const updatedTrader = await UpdateTrader(newData, trader);
  if (updatedTrader) {
    return res.status(200).json({
      status: "Account has been updated",
    });
  } else {
    return next(new appError("Error happend, please try again later", 400));
  }
}

async function httpDeleteTrader(req, res) {
  await req.trader.destroy();
  return res.status(200).json({
    status: "Account has been deleted",
  });
  /* I can delete the all records that the trader have, but maybe in the real world this data does not deleted
  try {
    const id = req.trader.id;
    await req.trader.destroy();
    await Promise.all([
      Product.destroy({ where: { trader: id } }),
      Client.destroy({ where: { trader: id } }),
      Order.destroy({ where: { trader: id } })
    ]);

    return res.status(200).json({
      message: "Trader and related data deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error deleting user and related data",
    });
  }*/
}

async function httpScheduleNotificationToClients(req, res, next) {
  const client = await getRequestData(req, FindClient);
  if (!client) {
    return next(new appError("Client is not exits", 400));
  }

  const { year, month, day, hour, minute, whichTime } = req.body;
  if (!year || !month || !day || !hour || !minute || !whichTime) {
    return res.status(400).json({
      messae:
        "Please enter year, month ,day ,hour ,minute, whichTime[ AM || PM ]",
    });
  }
  // Trader can schedule notification for there client at any time they want
  const scheduleNotification = scheduleNotificationToClients(
    year,
    month,
    day,
    hour,
    minute,
    whichTime
  );
  if (scheduleNotification < Date.now()) {
    return res.status(400).json({
      message:
        "Scheduling date must be greater than or equal to the current date.",
    });
  }

  const offerURL = `${req.protocol}://${req.get("host")}/v1/traders/offer/`;
  /*  we could use setTimeout
  const delay = scheduleNotification.getTime() - Date.now();
  try {
    setTimeout(async () => {
      await new email(client, offerURL).scheduleNotificationUrl();
    }, delay);

    return res.status(201).json({
      message: "Email scheduling successful.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Email hae not scheduling successful.",
    });
  }*/
  const job = schedule.scheduleJob(scheduleNotification, async function () {
    try {
      await new email(client, offerURL).scheduleNotificationUrl();
    } catch (err) {
      console.error("Scheduled email failed", err);
      return res.status(500).json({
        message: "Scheduled email failed to send",
        error: err,
      });
    }
  });

  return res.status(201).json({
    message:
      "Scheduling request accepted. The email will be sent at the specified time.",
  });
}

async function httpGetOrdersReportsThroughoutDay(req, res, next) {
  const { orders, productReport, totalSales } =
    await GetOrdersReportsThroughoutDay(req.trader);
  try {
    await new email(req.trader).sendReport(orders, productReport, totalSales);
    return res.status(200).json({
      status: "success",
      message: "Report has been sent",
    });
  } catch (err) {
    return res.status(201).json({
      message: "Could not send report email",
    });
  }
}

module.exports = {
  httpgetAllTrader,
  httpSignUpNewTrader,
  httpMyProfile,
  httpUpdateTrader,
  httpDeleteTrader,
  httpLogin,
  httpLogout,
  httpScheduleNotificationToClients,
  httpVerifyAccount,
  httpGetOrdersReportsThroughoutDay,
  httpSendVerifyTokenWhenSignDontSendToken,
};
