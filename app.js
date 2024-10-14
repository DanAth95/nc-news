const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const app = express();

app.get("/api/topics", getTopics);

app.get("*", (req, res, next) => {
  next({ status: 404, msg: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
