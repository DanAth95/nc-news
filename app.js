const express = require("express");

const app = express();
const apiRouter = require("./routers/api-router");
const topicsRouter = require("./routers/topics.router");
const usersRouter = require("./routers/users.router");
const commentsRouter = require("./routers/comments.router");
const articlesRouter = require("./routers/articles.router");

app.use(express.json());
app.use("/api", apiRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/articles", articlesRouter);

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

app.use("/api/articles/:article_id/comments", (err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "Article Not Found" });
  }
  next(err);
});
app.use("/api/articles", (err, req, res, next) => {
  if (err.code === "23503") {
    res.status(400).send({ msg: "Invalid Article" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
