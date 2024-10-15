const db = require("../db/connection");
const format = require("pg-format");
const { fetchArticleById } = require("./articles.model");

exports.fetchCommentsByArticleId = (id) => {
  return fetchArticleById(id)
    .then(() => {
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
        [id]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.createNewComment = (comment, id) => {
  if (!comment.body || !comment.username) {
    return Promise.reject({ status: 400, msg: "Invalid Comment" });
  }
  const { body, username } = comment;
  const sql = format(
    `INSERT INTO comments (body, article_id, author) VALUES (%L) RETURNING *`,
    [body, id, username]
  );
  return db.query(sql).then(({ rows }) => {
    return rows[0];
  });
};

exports.removeComment = (id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment Not Found" });
      }
    });
};

exports.updateComment = (update, id) => {
  const { inc_votes } = update;
  if (typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, msg: "Invalid Update" });
  }

  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
      [inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment Not Found" });
      }
      return rows[0];
    });
};
