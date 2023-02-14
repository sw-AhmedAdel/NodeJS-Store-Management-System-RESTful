const path = require("path");
const multer = require("multer");
const XlsxPopulate = require("xlsx-populate");
const appError = require("../../services/ClassErrMiddleware");
const filter = require("../../services/filter.calss");
const { getRequestData } = require("../../services/servicesFunction");
const { client, deleteHash } = require("../../cache/cache ");
const {
  CreateProduct,
  FindProduct,
  GetMyProduct,
  UpdateMyProduct,
} = require("../../models/product.model");

////////////////////////////////// USE MULTER TO UPLOAD EXCEL SHEET
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/products/files");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[0];
    cb(null, `product-${req.trader.id}-${Date.now()}${ext}.xlsx`);
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    if (file.size <= 5 * 1024 * 1024) {
      cb(null, true);
    } else {
      cb(new appError("Please upload file size less than 5MB", 400), false);
    }
  } else {
    cb(
      new appError("Not an excel sheel! please upload only excel sheel", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadFileMiddleware = upload.single("filepath");

//////////////////////////////////  CRUD OPERATIONS
async function httpCreateProduct(req, res, next) {
  if (req.file) {
    req.body.filepath = req.file.filename;
  }
  req.body.trader = req.trader.id;
  const product = await CreateProduct(req.body);
  deleteHash(req.trader.id);
  return res.status(201).json({
    product,
  });
}

async function httpGetMyProduct(req, res, next) {
  const trader = req.trader.id;
  req.query.trader = trader;
  const feature = new filter(req.query);

  const { limit, skip } = feature.pagination();
  const products = await GetMyProduct(
    feature.filter(),
    feature.sort(["createdAt"]),
    feature.fields(),
    skip,
    limit
  );
  client.hset(req.traderHashId, req.key_value, JSON.stringify(products));
  client.expire(req.traderHashId, 100000);
  return res.status(200).json({
    status: "success",
    length: products.length,
    data: products,
  });
}

async function httpGetOneProduct(req, res, next) {
  const product = await getRequestData(req, FindProduct);
  if (!product) {
    return next(new appError("Product is not exits"));
  }
  return res.status(200).json({
    status: "success",
    data: product,
  });
}

async function httpDeleteMyProduct(req, res, next) {
  const product = await getRequestData(req, FindProduct);
  if (!product) {
    return next(new appError("Product is not exits"));
  }
  await product.destroy();
  deleteHash(req.trader.id);
  return res.status(200).json({
    status: "Product has been deleted",
  });
}

async function httpUpdateMyProduct(req, res, next) {
  let product = await getRequestData(req, FindProduct);
  if (!product) {
    return next(new appError("Product is not exits"));
  }
  if (req.body.quantity) {
    return next(
      new appError(
        "Please update quantity using update excel sheet end point",
        400
      )
    );
  }
  const editProduct = { ...req.body };
  if (Object.keys(editProduct).length) {
    product = await UpdateMyProduct(editProduct, product);
  }
  deleteHash(req.trader.id);
  return res.status(200).json({
    status: "success",
    data: product,
  });
}

async function httpUpdateProductQuantityUsingExcelSheet(req, res, next) {
  // Get the product data
  const product = await getRequestData(req, FindProduct);
  if (!product) {
    return next(new appError("Product does not exist"));
  }
  if (!product.filepath) {
    return next(
      new appError("Product does not have an associated excel sheet")
    );
  }

  // Read the existing Excel sheet
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    "products",
    "files",
    product.filepath
  );
  let workbook;

  workbook = await XlsxPopulate.fromFileAsync(filePath);
  if (!workbook) {
    return next(new appError(`Error reading Excel sheet: ${error.message}`));
  }

  // Find the "quantity" row in the sheet
  // Find the "quantity" row in the sheet
  let quantityRow;
  let quantityCol;
  let found = false;
  workbook
    .sheet(0)
    .usedRange()
    .value()
    .some((row, rowIndex) => {
      // Usead soem instead of forEach coz i can break the loop if i got the value
      // forEach does not support that
      row.some((col, colIndex) => {
        if (col === "quantity") {
          quantityRow = rowIndex + 1;
          quantityCol = colIndex + 1;
          found = true;
          return true;
        }
        return false;
      });
      return found;
    });

  if (!quantityRow) {
    return next(
      new appError("Could not find the 'quantity' column in the excel sheet")
    );
  }
  // Update the "quantity" value
  workbook
    .sheet(0)
    .cell(quantityRow + 1, quantityCol)
    .value(req.body.quantity);

  // Save the changes to the file
  try {
    await workbook.toFileAsync(filePath);
    product.quantity = req.body.quantity;
    await product.save();
    deleteHash(req.trader.id);
    res.status(200).json({
      message: "Product quantity updated successfully in excel sheet",
    });
  } catch (error) {
    return next(new appError(`Error writing to Excel sheet: ${error.message}`));
  }
}

module.exports = {
  httpCreateProduct,
  httpGetMyProduct,
  httpGetOneProduct,
  httpDeleteMyProduct,
  httpUpdateMyProduct,
  uploadFileMiddleware,
  httpUpdateProductQuantityUsingExcelSheet,
};
