const express = require("express");
const orderRouter = express.Router();

const {
  httpCreateOrder,
  httpGetMyOrder,
  httpUpdateOrder,
  httpDeleteOrder,
  httpFindOrder,
} = require("./order.controller");

const { catchAsync } = require("../../services/GlobalHandelMiddleware");
const { auth } = require("../../auth/auth");

orderRouter.use(auth);
orderRouter.post("/create", catchAsync(httpCreateOrder));
orderRouter.get("/", catchAsync(httpGetMyOrder));
orderRouter.get("/oneorder/:id", catchAsync(httpFindOrder));
orderRouter.patch("/update/:id", catchAsync(httpUpdateOrder));
orderRouter.delete("/delete/:id", catchAsync(httpDeleteOrder));
module.exports = orderRouter;
