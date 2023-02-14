require("dotenv").config();
const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const { mysqlConnect } = require("./services/mysqlConnect");
require("./cache/cache ");

const {
  deleteTraderSchema,
  deleteProductSchema,
  deleteClientSchema,
} = require("./services/servicesFunction");

async function startServer() {
  try {
    await mysqlConnect();

    console.log("Connected to Mysql");
    console.log(`Running on ${process.env.NODE_ENV}`);

    if (process.argv[2] === "t") {
      await deleteTraderSchema();
    }

    if (process.argv[2] === "p") {
      await deleteProductSchema();
    }

    if (process.argv[2] === "c") {
      await deleteClientSchema();
    }

    if (process.argv[2] === "all") {
      await deleteTraderSchema();
      await deleteProductSchema();
      await deleteClientSchema();
    }

    server.listen(process.env.PORT, () => {
      console.log("Running the server");
    });
  } catch (err) {
    console.log(err.message);
  }
}

startServer();
