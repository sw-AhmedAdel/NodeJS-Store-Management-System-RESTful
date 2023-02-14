const express = require("express");
const productRouter = express.Router();

const {
  httpCreateProduct,
  httpGetMyProduct,
  httpGetOneProduct,
  httpDeleteMyProduct,
  httpUpdateMyProduct,
  uploadFileMiddleware,
  httpUpdateProductQuantityUsingExcelSheet,
} = require("./product.controller");

const { catchAsync } = require("../../services/GlobalHandelMiddleware");
const { auth } = require("../../auth/auth");
const { cashingProducts } = require("../../cache/cache ");
productRouter.use(catchAsync(auth));

productRouter.post(
  "/create",
  uploadFileMiddleware,
  catchAsync(httpCreateProduct)
);
productRouter.get("/myproducts", cashingProducts, catchAsync(httpGetMyProduct));
productRouter.get("/myproduct/:id", catchAsync(httpGetOneProduct));
productRouter.delete("/deleteproduct/:id", catchAsync(httpDeleteMyProduct));
productRouter.patch("/updateproduct/:id", catchAsync(httpUpdateMyProduct));
productRouter.patch(
  "/update/excel/:id",
  catchAsync(httpUpdateProductQuantityUsingExcelSheet)
);

module.exports = productRouter;
