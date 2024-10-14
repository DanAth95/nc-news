const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/topics.controller");
const app = express();
const endpoints = require("./endpoints.json");

app.get("/api/topics", getTopics);

app.get("/api", (req, res) => {
  res.send({ endpoints });
});

app.get("*", (req, res, next) => {
  next({ status: 404, msg: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
