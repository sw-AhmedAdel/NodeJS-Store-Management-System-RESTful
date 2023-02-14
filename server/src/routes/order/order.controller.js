const {
  CreateOrder,
  UpdateOrder,
  FindOrder,
  GetMyOrders,
} = require("../../models/order.model");

const { FindClient } = require("../../models/client.model");
const { FindProduct } = require("../../models/product.model");

const appError = require("../../services/ClassErrMiddleware");
const { getRequestData } = require("../../services/servicesFunction");

async function httpCreateOrder(req, res, next) {
  req.body.trader = req.trader.id;

  const isProductExits = await FindProduct({
    trader: req.body.trader,
    id: req.body.product,
  });
  if (!isProductExits) {
    return next(new appError("Product is not exits", 400));
  }

  const isClientExits = await FindClient({
    trader: req.body.trader,
    id: req.body.client,
  });

  if (!isClientExits) {
    return next(new appError("Client is not exits", 400));
  }

  const order = await CreateOrder(req.body);
  return res.status(201).json({
    order,
  });
}

async function httpGetMyOrder(req, res, next) {
  const trader = req.trader.id;
  const orders = await GetMyOrders({ trader });
  return res.status(200).json({
    status: "success",
    length: orders.length,
    data: orders,
  });
}

async function httpFindOrder(req, res, next) {
  const order = await getRequestData(req, FindOrder);
  if (!order) {
    return next(new appError("Order is not exits", 400));
  }
  return res.status(200).json({
    status: "success",
    order,
  });
}

async function httpUpdateOrder(req, res, next) {
  const isProductExits = await FindProduct({
    trader: req.trader.id,
    id: req.body.product,
  });
  if (!isProductExits) {
    return next(new appError("Product is not exits", 400));
  }

  const isClientExits = await FindClient({
    trader: req.trader.id,
    id: req.body.client,
  });

  if (!isClientExits) {
    return next(new appError("Client is not exits", 400));
  }

  let order = await getRequestData(req, FindOrder);

  if (!order) {
    return next(new appError("Order is not exits", 400));
  }

  const editData = { ...req.body };
  if (Object.keys(editData).length) {
    client = await UpdateOrder(order, editData);
  }
  return res.status(200).json({
    status: "success",
    data: order,
  });
}

async function httpDeleteOrder(req, res, next) {
  let order = await getRequestData(req, FindOrder);

  if (!order) {
    return next(new appError("Client is not exits", 400));
  }

  await order.destroy();
  return res.status(200).json({
    status: "Order has been deleted",
  });
}

module.exports = {
  httpCreateOrder,
  httpDeleteOrder,
  httpFindOrder,
  httpGetMyOrder,
  httpUpdateOrder,
};
