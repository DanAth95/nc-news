const { fetchArticleById } = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const id = req.params.article_id;
  return fetchArticleById(id)
    .then((article) => {
      res.send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
