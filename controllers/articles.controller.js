const {
  fetchArticleById,
  fetchArticles,
  updateArticle,
  createArticle,
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
    .then(([articles, total_count]) => {
      res.send({ articles, total_count: total_count[0].total_count });
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

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  return createArticle(newArticle)
    .then((newArticle) => {
      res.status(201).send({ newArticle });
    })
    .catch((err) => {
      next(err);
    });
};
