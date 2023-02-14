const express = require("express");
const clientRouter = express.Router();

const {
  httpCreateClient,
  httpGetMyClients,
  httpFindClient,
  httpUpdateClient,
  httpDeleteClient,
  uploadFileMiddleware,
} = require("./client.controller");

const { catchAsync } = require("../../services/GlobalHandelMiddleware");
const { auth } = require("../../auth/auth");

clientRouter.use(auth);
clientRouter.post(
  "/create",
  uploadFileMiddleware,
  catchAsync(httpCreateClient)
);
clientRouter.get("/", catchAsync(httpGetMyClients));
clientRouter.get("/oneclient/:id", catchAsync(httpFindClient));
clientRouter.patch("/update/:id", catchAsync(httpUpdateClient));
clientRouter.delete("/delete/:id", catchAsync(httpDeleteClient));
module.exports = clientRouter;
