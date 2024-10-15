const {
  fetchCommentsByArticleId,
  createNewComment,
  removeComment,
  updateComment,
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
      res.status(201).send({ newComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const id = req.params.comment_id;
  return removeComment(id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchComment = (req, res, next) => {
  const id = req.params.comment_id;
  const update = req.body;
  return updateComment(update, id)
    .then((updatedComment) => {
      res.send({ updatedComment });
    })
    .catch((err) => {
      next(err);
    });
};
