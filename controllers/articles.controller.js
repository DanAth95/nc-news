const { fetchArticleById, fetchArticles } = require("../models/articles.model");

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

exports.getArticles = (req, res, next) => {
  return fetchArticles()
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
