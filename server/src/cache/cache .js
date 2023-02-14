const { promisify } = require("util");

const redis = require("redis");
const client = redis.createClient({
  legacyMode: true,
});
client.hget = promisify(client.hget);
async function startServer() {
  await client.connect();
}

client.on("connect", function () {
  console.log("Connecting to redis");
});

client.on("ready", function () {
  console.log("Redis is ready to be used");
});

client.on("end", function () {
  console.log("Clinet is disconnect ");
});

client.on("error", function (err) {
  console.log(err.message);
});

startServer();

async function cashingProducts(req, res, next) {
  let key_value;
  if (Object.keys(req.query).length === 0) {
    key_value = "products";
  } else {
    key_value = `products${JSON.stringify(req.query)}`;
  }

  const traderHashId = req.trader.id;

  const products = await client.hget(traderHashId, key_value);
  if (products) {
    return res.status(200).json({
      status: "success",
      results: JSON.parse(products).length,
      products: JSON.parse(products),
    });
  } else {
    req.traderHashId = traderHashId;
    req.key_value = key_value;
    next();
  }
}

function deleteHash(hashKey) {
  // Delete the all hashes theat the trader has when he create update delete product
  client.del(JSON.stringify(hashKey));
}
module.exports = {
  client,
  cashingProducts,
  deleteHash,
};
