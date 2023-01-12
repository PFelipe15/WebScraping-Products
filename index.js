const express = require("express");
const dbConection = require("./src/db/connectionMongo");
const {
  GetProductInAmazon,
  GetProductInMercadoLivre,
  list,
} = require("./src/controllers/ProductController");
const Routes = require("./src/routes");
const app = express();
//DB CONNECTION
dbConection();
app.use(express.json());

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});

app.use("/api", Routes);
