const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/topics.controller");
const app = express();
const endpoints = require("./endpoints.json");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentToArticle,
  deleteComment,
} = require("./controllers/comments.controller");
const {
  getUsers,
  getUserByUsername,
} = require("./controllers/users.controller");

app.use(express.json());

app.get("/api", (req, res) => {
  res.send({ endpoints });
});
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername);

app.post("/api/articles/:article_id/comments", postCommentToArticle);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("*", (req, res, next) => {
  next({ status: 404, msg: "Not Found" });
});

app.use("/api/articles/:article_id", (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Article ID" });
  }
  next(err);
});

app.use("/api/comments/:comment_id", (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid Comment ID" });
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
