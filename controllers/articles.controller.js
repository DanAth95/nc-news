const {
  fetchArticleById,
  fetchArticles,
  updateArticle,
} = require("../models/articles.model");

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
  const query = req.query;
  return fetchArticles(query)
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const update = req.body;
  const id = req.params.article_id;
  return updateArticle(update, id)
    .then((updatedArticle) => {
      res.send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
