const multer = require("multer");
const appError = require("../../services/ClassErrMiddleware");
const { getRequestData } = require("../../services/servicesFunction");

const {
  CreateClient,
  GetMyClients,
  FindClient,
  UpdateClient,
} = require("../../models/client.model");

////////////////////////////////// USE MULTER TO UPLOAD EXCEL SHEET
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/clients/files");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[0];
    cb(null, `client-${req.trader.id}-${Date.now()}${ext}.xlsx`);
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
async function httpCreateClient(req, res, next) {
  if (req.file) {
    req.body.filepath = req.file.filename;
  }

  req.body.trader = req.trader.id;
  const client = await CreateClient(req.body);
  return res.status(201).json({
    client,
  });
}

async function httpGetMyClients(req, res, next) {
  const trader = req.trader.id;
  const clients = await GetMyClients({ trader });
  return res.status(200).json({
    status: "success",
    length: clients.length,
    data: clients,
  });
}

async function httpFindClient(req, res, next) {
  const client = await getRequestData(req, FindClient);
  if (!client) {
    return next(new appError("Client is not exits", 400));
  }
  return res.status(200).json({
    status: "success",
    client,
  });
}

async function httpUpdateClient(req, res, next) {
  let client = await getRequestData(req, FindClient);

  if (!client) {
    return next(new appError("Client is not exits", 400));
  }

  const editData = { ...req.body };
  if (Object.keys(editData).length) {
    client = await UpdateClient(client, editData);
  }
  return res.status(200).json({
    status: "success",
    data: client,
  });
}

async function httpDeleteClient(req, res, next) {
  let client = await getRequestData(req, FindClient);

  if (!client) {
    return next(new appError("Client is not exits", 400));
  }

  await client.destroy();
  return res.status(200).json({
    status: "client has been deleted",
  });
}

module.exports = {
  httpCreateClient,
  httpGetMyClients,
  httpFindClient,
  httpUpdateClient,
  httpDeleteClient,
  uploadFileMiddleware,
};
