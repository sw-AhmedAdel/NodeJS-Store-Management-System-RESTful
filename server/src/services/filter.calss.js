// duration : {$gte: 5} اكبر من
//?duration[gte]=5&price[gte]=1000&sort=-price
const { Op } = require("sequelize");

class filter {
  constructor(query) {
    this.query = query;
  }

  getoOerators(filter) {
    // used to take the gte gt lte lt to convert it to  {[OP.gte] : value}
    //?price[gte]=1500&ratingsAverage[gt]=4.5 make this like price  : {[OP.gte] : 1500}
    const sequelizeOp = ["price", "ratingsAverage"];
    Object.keys(filter).forEach((el) => {
      if (sequelizeOp.includes(el)) {
        const key = Object.keys(filter[el])[0];
        const value = filter[el][key];
        if (key.startsWith("g")) {
          if (key.endsWith("e")) {
            filter[el] = {
              [Op.gte]: value,
            };
          } else {
            filter[el] = {
              [Op.gt]: value,
            };
          }
        }
        if (key.startsWith("l")) {
          if (key.endsWith("e")) {
            filter[el] = {
              [Op.lte]: value,
            };
          } else {
            filter[el] = {
              [Op.lt]: value,
            };
          }
        }
      }
    });

    return filter;
  }

  filter() {
    let filter = { ...this.query };
    const excludeFileds = ["page", "limit", "sort", "fields"];
    excludeFileds.forEach((el) => delete filter[el]);
    filter = this.getoOerators(filter);
    return filter;
  }

  sort(option = "") {
    //sort=-price,-ratingsAverage convert it to array
    if (this.query.sort) {
      let order = [];
      const sortBy = this.query.sort.split(",");
      sortBy.forEach((el) => {
        if (el === "price" || el === "-price") {
          order.push(["price", el.startsWith("-") ? "DESC" : "ASC"]);
        }

        if (el === "ratingsAverage" || el === "-ratingsAverage") {
          order.push(["ratingsAverage", el.startsWith("-") ? "DESC" : "ASC"]);
        }
      });

      return order;
    } else {
      return option;
    }
  }
  fields() {
    // ?fields=price,numberOfReviews
    if (this.query.fields) {
      return this.query.fields.split(",");
    } else {
      return {
        __v: 0,
      };
    }
  }
  pagination() {
    const DEFAULT_PAGE_NUMBER = 1;
    const DEFAULT_LIMIT = 0;
    const page = Math.abs(this.query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(this.query.limit) || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    return {
      limit,
      skip,
    };
  }
}

module.exports = filter;
