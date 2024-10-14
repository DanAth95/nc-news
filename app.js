const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/topics.controller");
const app = express();
const endpoints = require("./endpoints.json");
const {
  getArticleById,
  getArticles,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentToArticle,
} = require("./controllers/comments.controller");

app.use(express.json());

app.get("/api", (req, res) => {
  res.send({ endpoints });
});
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentToArticle);

app.get("*", (req, res, next) => {
  next({ status: 404, msg: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Article ID" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "Article Not Found" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
