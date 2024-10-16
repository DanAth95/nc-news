const commentsRouter = require("express").Router();

const {
  getCommentsByArticleId,
  postCommentToArticle,
  deleteComment,
  patchComment,
} = require("../controllers/comments.controller");

commentsRouter.patch("/:comment_id", patchComment);
commentsRouter.delete("/:comment_id", deleteComment);

module.exports = commentsRouter;
