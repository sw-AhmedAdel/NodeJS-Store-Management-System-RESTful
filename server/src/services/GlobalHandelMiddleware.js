const appError = require("../services/ClassErrMiddleware");

function JsonWebTokenError() {
  const message = "Please signup or login, your token is invalid";
  return new appError(message, 401);
}

const TokenExpiredError = () =>
  new appError("your token is expired, please login again", 401);

function dublicateUniqueValue(err) {
  const message = `this value: ${Object.values(err.fields)} is already exits`;
  return new appError(message, 400);
}

function dataBaseErrors(err) {
  if (`${err.message}`.startsWith("Invalid value {")) {
    const message = `Invalid Errors: You must using field deals with numbers to get the data like price etc`;
    return new appError(message, 400);
  }
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Errors: ${errors.join(". ")}`;
  return new appError(message, 400);
}

function validateEmail() {
  const message = `Please enter a valid email`;
  return new appError(message, 400);
}

function sendErrorToDev(err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorToProd(err, res) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("ERROR", err);
    return res.status(500).json({
      status: "fail",
      message: "Something wrong happend, please try again",
    });
  }
}

function GlobalHandelMiddleware(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    // Send me the all error if we are on development

    sendErrorToDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // send a readable error to the user if we are on production

    let error = Object.assign(err);

    if (
      error.original?.code === "ER_DUP_ENTRY" &&
      error.original?.errno === 1062
    ) {
      error = dublicateUniqueValue(error);
    }

    if (
      error.message === "Validation error: Validation isEmail on email failed"
    ) {
      error = validateEmail();
    }

    if (error.name === "JsonWebTokenError") {
      error = JsonWebTokenError();
    }

    if (error.name === "TokenExpiredError") {
      error = TokenExpiredError();
    }

    if (error.statusCode === 500 && error.status === "error") {
      error = dataBaseErrors(error);
    }

    sendErrorToProd(error, res);
  }
}

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  GlobalHandelMiddleware,
  catchAsync,
};
