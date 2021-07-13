const db = require("../db");

function checkDuplicateUsername(req, res, next) {
  try {
    const strSql = 'SELECT * FROM users WHERE username = $1';
    const values = [req.body.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      if (user) {
        return res.status(200).send({
          message: "username existed"
        });
      }
      next();
  })} catch (err) {
    res.status(500).send(err.message);
  }
};

function checkDuplicateEmail(req, res, next) {
  try {
  const strSql = 'SELECT * FROM users WHERE email = $1';
  const values = [req.body.email];
  db.query(strSql, values, (errQuery, resQuery) => {
    if (errQuery) {
      res.status(500).send(errQuery.message);
      return;
    }
    const user = resQuery.rows[0];
    if (user && (!req.userId || req.userId !== user.id)) {
      return res.status(200).send({
        message: "email existed"
      });
    }
    next();
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

const verifySignUp = {
  checkDuplicateUsername: checkDuplicateUsername,
  checkDuplicateEmail: checkDuplicateEmail,
};

module.exports = verifySignUp;