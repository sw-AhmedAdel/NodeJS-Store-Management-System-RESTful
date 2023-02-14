const Order = require("./order.mysql");

async function FindOrder(filter) {
  return await Order.findOne({
    where: filter,
  });
}

async function CreateOrder(order) {
  const newOrder = await Order.create(order);
  return newOrder;
}

async function GetMyOrders(filter) {
  const orders = await Order.findAll({
    where: filter,
  });
  return orders;
}

async function UpdateOrder(order, newData) {
  await order.update(newData);
  return order.dataValues;
}

module.exports = {
  CreateOrder,
  UpdateOrder,
  FindOrder,
  GetMyOrders,
};
