const {
  fetchCommentsByArticleId,
  createNewComment,
} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const id = req.params.article_id;
  return fetchCommentsByArticleId(id)
    .then((comments) => {
      res.send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentToArticle = (req, res, next) => {
  const comment = req.body;
  const id = req.params.article_id;
  return createNewComment(comment, id)
    .then((newComment) => {
      console.log(newComment);
      res.status(201).send({ newComment });
    })
    .catch((err) => {
      next(err);
    });
};
