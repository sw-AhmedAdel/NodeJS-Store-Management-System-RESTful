const express = require("express");
const app = express();
const helmet = require("helmet");
const api = require("./routes/api");
const appError = require("./services/ClassErrMiddleware");
const cookieParser = require("cookie-parser");
const { GlobalHandelMiddleware } = require("./services/GlobalHandelMiddleware");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too many request",
});
app.use(express.json());
app.use(cookieParser(process.env.SECRET_JWT));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ["price", "name", "company", "ratingsAverage", "category"],
  })
);

app.use("/v1", limiter);
app.use("/v1", api);
app.all("*", (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(GlobalHandelMiddleware); // Catch global errors
module.exports = app;
