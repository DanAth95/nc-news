const { fetchTopics, createTopic } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  return fetchTopics()
    .then((topics) => {
      res.send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postTopic = (req, res, next) => {
  const newTopic = req.body;
  return createTopic(newTopic)
    .then((newTopic) => {
      res.status(201).send({ newTopic });
    })
    .catch((err) => {
      next(err);
    });
};
