const express = require("express");
const ProductController = require("../controllers/ProductController");

const router = express.Router();

router.get("/find/:search", ProductController.getAllProducts); //Faz WebScraping do Produto Digitado
router.get("/myProducts", ProductController.ShowAllProducts); //Retorna Produtos do Banco de Dados que já foram Raspados
router.delete("/delete", ProductController.deleteAllProducts); // Deleta Produtos Raspados do Banco de dados
router.post("/findkeyworld", ProductController.getMyProductBdForkeyWord);
router.post("/findforPrice", ProductController.getMyProductBdForPrice);
router.get("/getKeywords", ProductController.getKeywordsBd);
module.exports = router;
