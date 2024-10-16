const db = require("../db/connection");
const format = require("pg-format");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Topics Not Found" });
    }
    return rows;
  });
};

exports.createTopic = (newTopic) => {
  if (!newTopic.slug || !newTopic.description) {
    return Promise.reject({ status: 400, msg: "Invalid Topic" });
  }
  const { slug, description } = newTopic;
  const sql = format(`INSERT INTO topics VALUES (%L) RETURNING *`, [
    slug,
    description,
  ]);
  return this.fetchTopics()
    .then((topics) => {
      let alreadyExists = false;
      topics.forEach((topic) => {
        if (topic.slug === newTopic.slug) {
          alreadyExists = true;
        }
      });
      if (alreadyExists) {
        return Promise.reject({ status: 400, msg: "Topic Already Exists" });
      }
      return db.query(sql);
    })
    .then(({ rows }) => {
      return rows[0];
    });
};
