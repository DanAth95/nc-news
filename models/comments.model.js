const db = require("../db/connection");
const format = require("pg-format");

exports.fetchCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
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
