const puppeteer = require("puppeteer");
const { Product } = require("../models/Product.js");

async function GetProductInMercadoLivre(req, res) {
  const search = await req.params.search;
  const url = "https://www.mercadolivre.com.br/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
    console.log("Entrei na Url: " + url);
  } catch (error) {
    return console.log(`O site ${url} está forma do Ar.`);
  }

  // Entrando Mercado Livre
  await page.waitForSelector("#cb1-edit");
  await page.type("#cb1-edit", search);
  await Promise.all([page.waitForNavigation(), page.click(".nav-search-btn")]);
  const links = await page.$$eval(".ui-search-result__image > a", (el) =>
    el.map((link) => link.href)
  );

  for (const link of links) {
    await page.goto(link);
    await page.waitForSelector(".ui-pdp-title");
    const title = await page.$eval(
      ".ui-pdp-title",
      (element) => element.innerHTML
    );

    const price = await page.$eval(
      ".andes-money-amount__fraction",
      (element) => element.innerHTML
    );

    const seller = await page.evaluate(async () => {
      const el = document.querySelector(".ui-pdp-seller__link-trigger");

      if (!el) {
        return "Not Found";
      }
      return el.innerText;
    });

    const product = {};

    product.title = title;
    product.price = price;
    product.seller = seller;
    product.link = link;
    product.commerce = "Mercado Livre";
    product.keyword = search;
    await page.goBack();

    const response = await Product.create(product);
    console.log(response);
  }

  await page.waitForTimeout(30000);
  await browser.close();
}
async function GetProductInAmazon(req, res) {
  const search = await req.params.search;
  const url = "https://www.amazon.com.br/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    console.log("Entrei na URL: " + url);
  } catch (error) {
    return console.log(`O site ${url} está fora do Ar!`);
  }

  await page
    .waitForSelector("#twotabsearchtextbox")
    .then(() => {
      return;
    })
    .catch(() => {
      console.log("Erro no Waiting for Selector da pagina da Amazon");
    });
  await page.type("#twotabsearchtextbox", search);
  await Promise.all([
    page.waitForNavigation(),
    page.click("#nav-search-submit-button"),
  ]);

  const links = await page.$$eval(".s-line-clamp-4 > a", (el) =>
    el.map((link) => link.href)
  );

  for (const link of links) {
    await page.goto(link);

    await page.waitForSelector("#titleSection");
    const title = await page.$eval(
      "#titleSection",
      (element) => element.innerText
    );
    let price = await page.$eval(
      ".a-offscreen",
      (element) => element.innerText
    );

    let strPrice = price.replace("R$", "");

    const product = {};

    product.title = title;
    strPrice === "" ? (strPrice = "Not Found") : (product.price = strPrice);

    product.seller = "Amazon";
    product.commerce = "Amazon";
    product.link = link;
    product.keyword = search;
    const response = await Product.create(product);
    console.log(response);
  }

  page.waitForTimeout(3000);
}
async function GetProductsInShoppe(req, res) {
  let url = "https://shopee.com.br/";
  let i = 0;
  let search = req.params.search;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.goto(url);
    console.log("Entrei na URL: " + url);
  } catch (error) {
    console.log("Erro ao Conectar na Url:", url);
  }

  await page.waitForSelector(".home-page");
  await page.click(".home-page").then(() => {});
  await page.waitForSelector(".shopee-searchbar-input__input");
  await page.type(".shopee-searchbar-input__input", search);
  await Promise.all([page.waitForNavigation(), page.keyboard.press("Enter")]);

  await page.waitForSelector(".shopee-search-item-result__item");
  const links = await page.$$eval(
    ".shopee-search-item-result__item > a",
    (el) => el.map((link) => link.href)
  );

  for (const link of links) {
    await page.goto(link);

    await page.waitForSelector(".YPqix5").then(() => {
      return;
    })
    .catch(() => {
      console.log("Erro no Waiting for Selector da pagina da Shoope");
      return
    });
    const title = await page.$eval(".YPqix5", (el) => el.innerText);

    const price = await page.$eval(".X0xUb5", (el) => el.innerHTML);
    let strPrice = price.replace("R$", "");

    const seller = await page.$eval(".FbKovn", (el) => el.innerText);

    const product = {};
    product.title = title;

    Number.isNaN(strPrice)
      ? (product.price = "Not Found")
      : (product.price = strPrice);

    product.seller = seller;
    product.commerce = "Shoope";
    product.link = link;
    product.keyword = search;
    const response = await Product.create(product);
    console.log(response);

    i++;
  }
}
async function getAllProducts(req, res) {
  GetProductInAmazon(req, res);
  GetProductInMercadoLivre(req, res);
  GetProductsInShoppe(req, res);
}
async function ShowAllProducts(req, res) {
  const AllProducts = await Product.find();
  res.json({ "Produtos Listados:": AllProducts });
}
async function deleteAllProducts(req, res) {
  try {
    await Product.deleteMany({});
    res.json({ msg: "Banco de Dados de Produtos deletado com sucesso!" });
  } catch (error) {
    console.log(error);
  }
}
async function getMyProductBdForkeyWord(req, res) {
  const keyWord = req.body.keyWord;
  const orderBy = req.body.orderBy;
  try {
    let myProducts = await Product.find({ keyword: keyWord }).sort({
      price: orderBy || "asc",
    });

    if (myProducts.length === 0) {
      return res
        .status(401)
        .json(`Não há Dados Relacionados com o titulo: ${keyWord} `);
    } else {
      return res
        .status(200)
        .send({ "Produtos Relacioados a Pesquisa: ": myProducts });
    }
  } catch (error) {
    console.log(error);
  }
}
async function getMyProductBdForPrice(req, res) {
  const price = req.body.price;
  const orderBy = req.body.orderBy;
  try {
    const myProducts = await Product.find({ price: price });
    console.log(myProducts);
    if (myProducts) {
      return res.status(200).send({ "Produtos Com Esse Preco: ": myProducts });
    } else {
      return res.status(401).send(`Não há Dados Relacionados com ${title} `);
    }
  } catch (error) {
    console.log(error);
  }
}
async function getKeywordsBd(req, res) {
  let products = await Product.find({});

  const keywords = products.map((product) => {
    return product.keyword;
  });

  const keywordUnique = [...new Set(keywords)];
  res.json(keywordUnique);
}

module.exports = {
  GetProductInAmazon,
  GetProductInMercadoLivre,
  getAllProducts,
  ShowAllProducts,
  deleteAllProducts,
  getMyProductBdForkeyWord,
  getMyProductBdForPrice,
  getKeywordsBd,
};
