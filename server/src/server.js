require("dotenv").config();
const http = require("http");

process.on("uncaughtException", function (err) {
  console.log(err);
  console.log("uncaught Exceptions");
  console.log(err.name, err.message);
  process.exit(1);
});

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

process.on("unhandledRejection", (err) => {
  console.log("unhandled Rejection");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
