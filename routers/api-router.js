const apiRouter = require("express").Router();
const endpoints = require("../endpoints.json");

apiRouter.get("/", (req, res) => {
  res.send({ endpoints });
});

module.exports = apiRouter;
