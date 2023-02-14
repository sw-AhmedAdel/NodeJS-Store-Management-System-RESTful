const express = require("express");
const api = express.Router();
const traderRoute = require("./trader/trader.routes");
const productRouter = require("./product/product.routes");
const clientRouter = require("./client/client.router");
const orderRouter = require("./order/order.router");

api.use("/trader", traderRoute);
api.use("/product", productRouter);
api.use("/client", clientRouter);
api.use("/order", orderRouter);
module.exports = api;
