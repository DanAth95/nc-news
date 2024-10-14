const { fetchTopics } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  return fetchTopics()
    .then((topics) => {
      res.send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
