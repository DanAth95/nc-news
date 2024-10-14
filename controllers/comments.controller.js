const { fetchCommentsByArticleId } = require("../models/comments.model");

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
