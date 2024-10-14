const { fetchUsers } = require("../models/users.model");

exports.getUsers = (req, res, next) => {
  return fetchUsers()
    .then((users) => {
      res.send({ users });
    })
    .catch((err) => {
      next(err);
    });
};
