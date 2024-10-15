const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("*", () => {
  test("GET 404: responds with error message if API is not found", () => {
    return request(app)
      .get("/notARoute")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found");
      });
  });
});

describe("/api/topics", () => {
  test("GET 200 responds with array of topic objects with properties 'slug' and 'description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("/api", () => {
  test("GET 200 responds with endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.endpoints).toEqual(endpoints);
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200 responds article by article_id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article.title).toBe(
          "Living in the shadow of a great man"
        );
        expect(response.body.article.topic).toBe("mitch");
        expect(response.body.article.author).toBe("butter_bridge");
        expect(response.body.article.body).toBe(
          "I find this existence challenging"
        );
        expect(response.body.article.created_at).toBe(
          "2020-07-09T20:11:00.000Z"
        );
        expect(response.body.article.votes).toBe(100);
        expect(response.body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  test("GET 404 responds not found when passed article ID that is valid but doesnt exist", () => {
    return request(app)
      .get("/api/articles/100")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });
  test("GET 400 responds Invalid Article Id when passed invalid article ID", () => {
    return request(app)
      .get("/api/articles/not-a-valid-id")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Article ID");
      });
  });
  test("PATCH 200 responds with the updated article", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(update)
      .expect(200)
      .then((response) => {
        expect(response.body.updatedArticle[0].votes).toBe(101);
        expect(response.body.updatedArticle[0].article_id).toBe(1);
      });
  });
  test("PATCH 200 responds with the updated article when votes are decreased", () => {
    const update = { inc_votes: -1 };
    return request(app)
      .patch("/api/articles/1")
      .send(update)
      .expect(200)
      .then((response) => {
        expect(response.body.updatedArticle[0].votes).toBe(99);
        expect(response.body.updatedArticle[0].article_id).toBe(1);
      });
  });
  test("PATCH 404 responds with Article Not Found when passed article_id that doesnt exist", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/100")
      .send(update)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });
  test("PATCH 400 responds with Invalid Article ID when passed invalid article id", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/not-valid")
      .send(update)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Article ID");
      });
  });
  test("PATCH 400 responds with Invalid Update when passed update not including inc_votes", () => {
    const update = { inc: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(update)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Update");
      });
  });
  test("GET 200, article response now includes comment_count", () => {
    return request(app)
      .get("/api/articles/9")
      .expect(200)
      .then((response) => {
        expect(response.body.article.comment_count).toBe("2");
      });
  });
  test("GET 200, comment_count is 0 when no comments are found", () => {
    return request(app)
      .get("/api/articles/10")
      .expect(200)
      .then((response) => {
        expect(response.body.article.comment_count).toBe("0");
      });
  });
});

describe("/api/articles", () => {
  test("GET 200 responds with array of 10 articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
        });
      });
  });
  test("articles are ordered by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("articles are ordered by title descending when passed sort_by=title", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("title", {
          descending: true,
        });
      });
  });
  test("articles are ordered by id ascending when passed sort_by=article_id&order=asc", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("article_id", {
          ascending: true,
        });
      });
  });
  test("GET 400 when passed invalid sport_by criteria", () => {
    return request(app)
      .get("/api/articles?sort_by=not-valid&order=asc")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Query");
      });
  });
  test("GET 200 responds with articles of a specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        response.body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET 200 responds with articles of a specified topic when passed additional queries", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        response.body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET 404 when passed topic that doesnt exist", () => {
    return request(app)
      .get("/api/articles?topic=dogs")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Topic Not Found");
      });
  });
  test("POST 201 when passed article object", () => {
    const newArticle = {
      title: "Living in the shadow of an even greater man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence even more challenging than before",
      article_img_url: "image.url.com",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.newArticle.author).toBe("butter_bridge");
        expect(response.body.newArticle.title).toBe(
          "Living in the shadow of an even greater man"
        );
        expect(response.body.newArticle.topic).toBe("mitch");
        expect(response.body.newArticle.body).toBe(
          "I find this existence even more challenging than before"
        );
        expect(response.body.newArticle.article_img_url).toBe("image.url.com");
        expect(typeof response.body.newArticle.article_id).toBe("number");
        expect(response.body.newArticle.votes).toBe(0);
        expect(typeof response.body.newArticle.created_at).toBe("string");
        expect(response.body.newArticle.comment_count).toBe("0");
      });
  });
  test("POST 201 article_img_url defaults", () => {
    const newArticle = {
      title: "Living in the shadow of an even greater man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence even more challenging than before",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.newArticle.article_img_url).toBe("image.url.com");
      });
  });
  test("POST 400 when passed newArticle missing elements", () => {
    const newArticle = {
      title: "invalid article",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Article");
      });
  });
  test("POST 400 when passed newArticle has invalid values for columns", () => {
    const newArticle = {
      title: "Living in the shadow of an even greater man",
      topic: null,
      author: null,
      body: "I find this existence even more challenging than before",
      article_img_url: "image.url.com",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Article");
      });
  });
  test("GET 200 responds with array of first 5 articles when passed limit=5", () => {
    return request(app)
      .get("/api/articles?limit=5&sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        response.body.articles.forEach((article) => {
          expect(article.article_id <= 5).toBe(true);
        });
      });
  });
  test("GET 200 responds with array of second 5 articles when passed limit=5&p=2", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2&sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        response.body.articles.forEach((article) => {
          expect(5 < article.article_id).toBe(true);
          expect(article.article_id <= 10).toBe(true);
        });
      });
  });
  test("GET 200 response contains total_count property which is equal to total number of articles", () => {
    return request(app)
      .get("/api/articles?limit=5&sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe("13");
      });
  });
  test("GET 200 response when limit > total articles", () => {
    return request(app)
      .get("/api/articles?limit=40&sort_by=article_id&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe("13");
      });
  });
  test("GET 400 response when page number > total pages", () => {
    return request(app)
      .get("/api/articles?limit=5&p=4")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Page Not Found");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET 200 responds with all comments for given article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(11);
        response.body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });
  test("GET 200 comments ordered by created_at descending", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("GET 404 responds Article Not Found when passed valid id that doesnt exist", () => {
    return request(app)
      .get("/api/articles/100/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });
  test("GET 400 responds Invalid Article Id when passed invalid article ID", () => {
    return request(app)
      .get("/api/articles/not-a-valid-id/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Article ID");
      });
  });
  test("GET 200 responds empty array when article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/10/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toHaveLength(0);
      });
  });
  test("POST 201 responds with posted comment object", () => {
    const newComment = {
      body: "Brand New Comment",
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.newComment.author).toBe("lurker");
        expect(response.body.newComment.body).toBe("Brand New Comment");
        expect(typeof response.body.newComment.comment_id).toBe("number");
        expect(response.body.newComment.votes).toBe(0);
        expect(typeof response.body.newComment.created_at).toBe("string");
        expect(response.body.newComment.article_id).toBe(1);
      });
  });
  test("POST 400 responds with error if newComment isnt valid", () => {
    const newComment = {
      message: "Brand New Comment",
      name: "lurker",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Comment");
      });
  });
  test("POST 404 responds with error if articleID doesnt exist", () => {
    const newComment = {
      body: "Brand New Comment",
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/100/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article Not Found");
      });
  });
  test("POST 400 responds with error if articleID isnt valid", () => {
    const newComment = {
      body: "Brand New Comment",
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/not-valid/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Article ID");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE 204", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("DELETE 404 if passed comment_id that doesnt exist", () => {
    return request(app)
      .delete("/api/comments/100")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment Not Found");
      });
  });
  test("DELETE 400 if passed comment_id that isnt valid", () => {
    return request(app)
      .delete("/api/comments/not-valid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Comment ID");
      });
  });
  test("PATCH 200 responds with updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        expect(response.body.updatedComment.comment_id).toBe(1);
        expect(response.body.updatedComment.votes).toBe(17);
      });
  });
  test("PATCH 200 works for decrease in votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then((response) => {
        expect(response.body.updatedComment.comment_id).toBe(1);
        expect(response.body.updatedComment.votes).toBe(15);
      });
  });
  test("PATCH 404 for valid id that doesnt exist", () => {
    return request(app)
      .patch("/api/comments/100")
      .send({ inc_votes: -1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment Not Found");
      });
  });
  test("PATCH 400 for invalid id", () => {
    return request(app)
      .patch("/api/comments/not-valid")
      .send({ inc_votes: -1 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Comment ID");
      });
  });
  test("PATCH 400 for invalid inc_votes data type", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "not-valid" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid Update");
      });
  });
});

describe("/api/users", () => {
  test("GET 200 responds with array of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        response.body.users.forEach((user) => {
          expect(typeof user.name).toBe("string");
          expect(typeof user.username).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("/api/users/:username", () => {
  test("GET 200 responds user by given username", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then((response) => {
        expect(response.body.user.username).toBe("lurker");
        expect(response.body.user.name).toBe("do_nothing");
        expect(response.body.user.avatar_url).toBe(
          "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png"
        );
      });
  });
  test("GET 404 responds when username doesnt exist", () => {
    return request(app)
      .get("/api/users/not-a-username")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Username Not Found");
      });
  });
});
