const Product = require("./product.mysql");

async function CreateProduct(product) {
  const newProduct = await Product.create(product);
  return newProduct;
}

async function GetMyProduct(filter, sort, fields, skip, limit) {
  return await Product.findAll({
    where: filter,
    offset: skip,
    limit: limit || null,
    attributes: fields,
    order: sort,
  });
}
async function FindProduct(filter) {
  const product = await Product.findOne({
    where: filter,
  });
  return product;
}

async function UpdateMyProduct(editProduct, product) {
  await product.update(editProduct); // Use update will tragger the all validations in the Schema
  return product.dataValues;
}

module.exports = {
  CreateProduct,
  FindProduct,
  GetMyProduct,
  UpdateMyProduct,
};
