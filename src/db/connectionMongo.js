//a123123
const mongoose = require("mongoose");
async function main() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(
      "mongodb+srv://Felipe:a123123@cluster0.pvtd8bh.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("Conectado com Sucesso ao Banco!");
  } catch (error) {
    console.log(error);
  }
}
module.exports = main;
