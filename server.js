const http = require("http");
const fs = require("fs");
const path = require("path");
const { info } = require("console");
const { fstat } = require("fs");
const { request } = require("https");

const currenciesDbPath = path.join(__dirname, "db", "currencies.json");
let currenciesDB = [];

const PORT = 5000;
const HOST_NAME = "localhost";

const requestHandler = async function (req, res) {
  res.setHeader("content-Type", "application/json");
  const { url, method } = req;

  if (url === "/currencies" && method === "GET") {
    getAllCurrencies(req, res);
  } else if (url === "/currencies" && method === "POST") {
    addCurrency(req, res);
  } else if (url === "/currencies" && method === "PUT") {
    updateCurrency(req, req);
  } else if (url.startsWith === "/currencies" && method === "DELETE") {
    deleteCurrency(req, res);
  } else {
    res.writeHead(404);
    res.end(
      JSON.stringify({
        message: "Method Not Supported",
      })
    );
  }
};

// Retrieve All Currencies
const getAllCurrencies = function (req, res) {
  fs.readFile(currenciesDbPath, "utf8", (err, currencies) => {
    console.log(currencies);
    if (err) {
      console.log(err);
      res.writeHead(400);
      res.end("BAD REQUEST");
    }
    res.end(currencies);
  });
};

//CREATE A CURRENCY
const addCurrency = function (req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const newCurrency = JSON.parse(parsedBody);

    //GET ID OF THE LAST CURRENCY IN THE DATABASE
    const lastCurrency = currenciesDB[currenciesDB.lenght - 1];
    const lastCurrencyId = lastCurrency.id;
    newCurrency.id = lastCurrency.id + 1;

    //SAVE TO DATABASE
    currenciesDB.push(newCurrency);
    fs.writeFile(currenciesDbPath, JSON.stringify(currenciesDB), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message: "INTERNAL SERVER ERROR. CONTACT SUPPORT.",
          })
        );
      }
      res.end(JSON.stringify(newCurrency));
    });
  });
};

//UPDATE THE CURRENCY IN THE DATABASE
const updatedCurrency = function (req, res) {
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const parsedBody = Buffer.concat(body).toString();
    const updatedCurrency = JSON.parse(parsedBody);

    //FIND THE CURRENCY IN THE DATABASE
    const currencyIndex = currenciesDB.findIndex((currency) => {
      return currency.id === updatedCurrency.id;
    });

    //RETURN 404 IF CURRENCY NOT FOUND
    if (currencyIndex === -1) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          message: "CURRENCY NOT FOUND",
        })
      );
      return;
    }

    //UPDATE THE CURRENCY IN THE DATABASE
    currenciesDB[currencyIndex] = {
      ...currenciesDB[currencyIndex],
      ...updatedCurrency,
    };

    //SAVE TO THE DATABASE
    fs.writeFile(currenciesDbPath, JSON.stringify(currenciesDb), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message: "INTERNAL SERVER ERROR. CONTACT SUPPORT.",
          })
        );
      }
      res.end(JSON.stringify(updatedCurrency));
    });
  });
};

//DELETE A CURRENCY IN THE DATABASE
const deletcurrency = function (req, res) {
  const currencyId = req.url.split("/")[2];

  //REMOVE A CURRENCY IN THE DATABASE
  const currencyIndex = currenciesDB.findIndex((currency) => {
    return currency.id === parseInt(currencyId);
  });
  if (currencyIndex === -1) {
    res.writeHead(404);
    res.end(
      JSON.stringify({
        message: "CURRENCY NOT FOUND",
      })
    );
    return;
  }
  currenciesDB.splice(currencyIndex, 1);

  //UPDATE THE DATABASE
  fs.writeFile(currenciesDb, JSON.stringify(currenciesDB), (err) => {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          message: "INTERNAL SERVER ERROR. CONTACT SUPPORT.",
        })
      );
    }
    res.end(
      JSON.stringify({
        message: "CURRENCY IS DELETED",
      })
    );
  });
};
//CREATE SERVER
const server = http.createServer(requestHandler);
server.listen(PORT, HOST_NAME, () => {
  currenciesDB = JSON.parse(fs.writeFileSync(currenciesDbPath, "utf8"));
  console.log(`Server is listening on ${HOST_NAME}:${PORT}`);
});
