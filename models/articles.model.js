const db = require("../db/connection");
const format = require("pg-format");
const { fetchTopics } = require("./topics.model");

exports.fetchArticleById = (id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
      [id]
    )
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
    "comment_count",
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

  if (query.sort_by === "comment_count") {
    sql += ` GROUP BY articles.article_id ORDER BY ${
      query.sort_by
    } ${query.order.toUpperCase()}`;
  } else {
    sql += ` GROUP BY articles.article_id ORDER BY articles.${
      query.sort_by
    } ${query.order.toUpperCase()}`;
  }

  if (!query.limit) {
    query.limit = 10;
  }

  if (query.limit) {
    sql += ` LIMIT ${query.limit}`;
  }

  if (query.p) {
    sql += ` OFFSET ${(query.p - 1) * query.limit}`;
  }

  return fetchTopics()
    .then((topics) => {
      return db.query(sql, queryVals).then(({ rows }) => {
        const topicsSlugs = topics.map((topic) => {
          return topic.slug;
        });
        if (rows.length === 0 && topicsSlugs.includes(query.topic)) {
          return Promise.reject({ status: 200, msg: "No Articles" });
        }
        if (rows.length === 0 && query.topic) {
          return Promise.reject({ status: 404, msg: "Topic Not Found" });
        }

        let newSql = `SELECT COUNT(article_id) AS total_count FROM articles`;
        if (query.topic) {
          newSql += ` WHERE topic='${query.topic}'`;
        }

        return Promise.all([rows, db.query(newSql)]);
      });
    })
    .then(([articles, { rows }]) => {
      if (articles.length === 0) {
        return Promise.reject({ status: 404, msg: "Page Not Found" });
      }
      return [articles, rows];
    });
};

exports.updateArticle = (update, id) => {
  if (!update.inc_votes) {
    return Promise.reject({ status: 400, msg: "Invalid Update" });
  }
  if (typeof update.inc_votes != "number") {
    return Promise.reject({ status: 400, msg: "Invalid Vote Increment" });
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

exports.createArticle = (newArticle) => {
  if (
    !newArticle.title ||
    !newArticle.topic ||
    !newArticle.author ||
    !newArticle.body
  ) {
    return Promise.reject({ status: 400, msg: "Invalid Article" });
  }

  if (!newArticle.article_img_url) {
    newArticle.article_img_url = "image.url.com";
  }
  const { title, topic, author, body, article_img_url } = newArticle;

  const sql = format(
    `INSERT INTO articles (title, topic, author, body, article_img_url) VALUES (%L) RETURNING article_id`,
    [title, topic, author, body, article_img_url]
  );

  return db
    .query(sql)
    .then(({ rows }) => {
      const id = rows[0].article_id;
      return this.fetchArticleById(id);
    })
    .then((newArticle) => {
      return newArticle;
    });
};

exports.removeArticle = (id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1", [id])
    .then(({ rows }) => {
      const promises = rows.map((comment) => {
        return db.query(`DELETE FROM comments WHERE comment_id = $1`, [
          comment.comment_id,
        ]);
      });
      return Promise.all(promises);
    })
    .then(() => {
      return db.query(
        `DELETE FROM articles WHERE article_id = $1 RETURNING *`,
        [id]
      );
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
    });
};
