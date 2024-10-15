const db = require("../db/connection");
const format = require("pg-format");

exports.fetchArticleById = (id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows[0];
    });
};

exports.fetchArticles = (query) => {
  const allowedSortBy = [
    "article_id",
    "title",
    "created_at",
    "topic",
    "author",
    "votes",
  ];
  const allowedOrder = ["asc", "desc"];

  let sql = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;
  const queryVals = [];

  if (query.topic) {
    sql += ` WHERE articles.topic = $1`;
    queryVals.push(query.topic);
  }

  if (!query.sort_by) {
    query.sort_by = "created_at";
  }
  if (!query.order) {
    query.order = "desc";
  }

  if (
    !allowedSortBy.includes(query.sort_by) ||
    !allowedOrder.includes(query.order)
  ) {
    return Promise.reject({ status: 400, msg: "Invalid Query" });
  }

  sql += ` GROUP BY articles.article_id ORDER BY articles.${
    query.sort_by
  } ${query.order.toUpperCase()}`;

  return db.query(sql, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Topic Not Found" });
    }
    return rows;
  });
};

exports.updateArticle = (update, id) => {
  if (!update.inc_votes) {
    return Promise.reject({ status: 400, msg: "Invalid Update" });
  }
  const { inc_votes } = update;
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows;
    });
};
