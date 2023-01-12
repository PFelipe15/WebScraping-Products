const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: String,
    price: String,
    seller: String,
    commerce: String,
    link: String,
    keyword: String,
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
module.exports = {
  productSchema,
  Product,
};
