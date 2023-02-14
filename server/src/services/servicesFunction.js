const Trader = require("../models/trader.mysql");
const Product = require("../models/product.mysql");
const Client = require("../models/client.mysql");

function filterObject(objBody, ...filterBody) {
  const filter = {};
  Object.keys(objBody).forEach((el) => {
    if (filterBody.includes(el)) {
      filter[el] = objBody[el];
    }
  });
  return filter;
}

async function deleteTraderSchema() {
  try {
    await Trader.drop();
    console.log("Trader schema deleted successfully.");
  } catch (error) {
    console.error("Error deleting Trader schema:", error);
  }
}

async function deleteProductSchema() {
  try {
    await Product.drop();
    console.log("Product schema deleted successfully.");
  } catch (error) {
    console.error("Error deleting Trader schema:", error);
  }
}

async function deleteClientSchema() {
  try {
    await Client.drop();
    console.log("Client schema deleted successfully.");
  } catch (error) {
    console.error("Error deleting Trader schema:", error);
  }
}

async function getRequestData(req, find) {
  const id = req.params.id;
  const trader = req.trader.id;
  const data = await find({
    id,
    trader,
  });

  return data;
}

function scheduleNotificationToClients(
  year,
  month,
  day,
  hour,
  minute,
  whichTime
) {
  let scheduleNotification = new Date(
    `${year}-${month}-${day} ${hour}:${minute}:00`
  );

  if (whichTime === "pm" || whichTime === "AM") {
    scheduleNotification.setHours(scheduleNotification.getHours() + 12);
  }

  return scheduleNotification;
}

function getDateDuring24Hour() {
  const currentDate = new Date();
  const startOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const endOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    23,
    59,
    59
  );
  return {
    startOfDay,
    endOfDay,
  };
}

function getObjProductAndQuantity(orders) {
  // Get quantity for each product has been sold
  const products = {};
  let totalSales = 0;
  orders.forEach((order) => {
    const productName = order.Product.name;
    if (!products[productName]) {
      products[productName] = 0;
    }
    products[productName] += order.quantity;
    totalSales += Number(order.Product.price) * order.quantity;
  });
  return {
    products,
    totalSales,
  };
}

function getProductsReport(products) {
  const productReport = [];

  // Get Products report tha has name of product and how many time the product has beedn sold
  Object.keys(products).forEach((productName) => {
    productReport.push({
      name: productName,
      quantity: products[productName],
    });
  });
  return {
    productReport,
  };
}

module.exports = {
  filterObject,
  deleteTraderSchema,
  deleteProductSchema,
  deleteClientSchema,
  getRequestData,
  scheduleNotificationToClients,
  getDateDuring24Hour,
  getObjProductAndQuantity,
  getProductsReport,
};
