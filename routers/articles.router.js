const articlesRouter = require("express").Router();

const {
  getArticleById,
  getArticles,
  patchArticle,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentToArticle,
} = require("../controllers/comments.controller");

articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentToArticle);
articlesRouter.post("/", postArticle);
articlesRouter.patch("/:article_id", patchArticle);
articlesRouter.delete("/:article_id", deleteArticle);

module.exports = articlesRouter;
