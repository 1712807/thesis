const moment = require("moment");
const db = require("../db");
const config = require("../config/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var passwordGenerator = require('generate-password');
const { emailService } = require("../middleware");
const { EMAIL_TYPES, ACCESS_TOKEN_EXPIRES_TIME, REFRESH_TOKEN_EXPIRES_TIME } = require("../utils/constant");
const { sendEmail } = require("../middleware/emailService");

exports.signup = (req, res) => {
  const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
  try {
    const strSql = `INSERT INTO users(username, email, password, info, role, created_at) 
                    VALUES($1, $2, $3, $4, $5, $6) 
                    RETURNING id, username, email, info, created_at`;
    const {body: {username, email, password, info}} = req;
    const values = [
      username, 
      email, 
      bcrypt.hashSync(password, 8), 
      {...info, displayName: info.displayName ? info.displayName : username}, 
      "user", 
      now()
    ];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: ACCESS_TOKEN_EXPIRES_TIME
      });
      return res.status(200).send({
        message: "success",
        user: {
          id: user.id, 
          createdAt: user.created_at,
          username: user.username,
          info: user.info,
          role: user.role, 
        },
        token 
      });
  })} catch (err) {
    res.status(500).send(err.message);
  }
};


exports.createUser = (req, res) => {
  const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
  try {
    const strSql = `INSERT INTO users(username, email, password, info, role, editors_categories, created_at) 
                    VALUES($1, $2, $3, $4, $5, $6, $7) 
                    RETURNING id, username, email, info, created_at, role, editors_categories`;
    const {body: {username, displayName, email, password, role, categoriesList}} = req;
    const values = [username, email, bcrypt.hashSync(password, 8), {displayName}, role, categoriesList, now()];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const newUser = resQuery.rows[0];
      sendEmail([{email, displayName}], EMAIL_TYPES.newAccount, {account: {username, password, role}})
      return res.status(200).send({
        message: "success",
        newUser: {
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email, 
          info: newUser.info,
          created_at: newUser.created_at, 
          role: newUser.role,
          editorsCategories: newUser.editors_categories,
          status: "active"
        }
      });
  })} catch (err) {
    res.status(500).send(err.message);
  }
};

exports.signin = (req, res) => {
  try {
    const strSql = 'SELECT * FROM users WHERE username = $1';
    const values = [req.body.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      if (!user) {
        return res.status(200).send({ message: "username not_found" });
      }

      if (user.blocked_by) {
        return res.status(200).send({ message: `user_blocked ${user.blocked_by.reason}` });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(200).send({
          token: null,
          message: "password not_match"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: ACCESS_TOKEN_EXPIRES_TIME
      });
      var refreshToken = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: REFRESH_TOKEN_EXPIRES_TIME
      });

      const strSql = 'UPDATE users SET refresh_token = $1 WHERE id = $2';
      const values = [refreshToken, user.id];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          return res.status(200).send({
            message: "success",
            user: {
              id: user.id,
              createdAt: user.created_at,
              username: user.username,
              info: user.info,
              role: user.role,
            },
            token,
            refreshToken
          });
        })
  })} catch (err) {
    res.status(500).send(err.message);
  }
};

exports.changePassword = (req, res) => {
  if (req.userId !== req.body.userId) {
    res.status(404).send({ message: "Not authenticated!" });
    return;
  }

  try {
    const strSql = 'SELECT * FROM users WHERE id = $1';
    const values = [req.body.userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      if (!user) {
        res.status(404).send({ message: "User not found!" });
        return;
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(200).send({message: "password wrong"});
      }

      if (req.body.password === req.body.newPassword) {
        return res.status(200).send({message: "password not_changed"});
      }

      try {
        const strSql = 'UPDATE users SET password = $1 WHERE id = $2';
        const values = [bcrypt.hashSync(req.body.newPassword, 8), req.body.userId];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          return res.status(200).send({message: "success"})
        })}
      catch(err) {
        res.status(500).send(err.message);
      }
  })} catch (err) {
    res.status(500).send(err.message);
  }
};

exports.resetPassword = (req, res) => {
  try {
    const {body: {username, email}} = req;
    const strSql = 'SELECT * FROM users WHERE username = $1 AND email = $2';
    const values = [username, email];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      if (!user) {
        return res.status(200).send({ message: "user_not_found" });
      }
      if (user.blocked_by) {
        return res.status(200).send({message: `user_blocked ${user.blocked_by.reason}`})
      }

      try {
        const randomPassword = passwordGenerator.generate({length: 20, number: true});
        const strSql = 'UPDATE users SET password = $1 WHERE username = $2';
        const values = [bcrypt.hashSync(randomPassword, 8), username];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          try {
            emailService.sendEmail([{email: user.email, displayName: user.info.displayName}], EMAIL_TYPES.passwordReseted, {newPassword: randomPassword});
            return res.status(200).send({message: "success"})
          } catch (err) {
            res.status(500).send(err.message);
          }
        })}
      catch(err) {
        res.status(500).send(err.message);
      }
  })} catch (err) {
    res.status(500).send(err.message);
  }
};

exports.editInfo = (req, res) => {
  if (req.userId !== req.body.userId) {
    res.status(404).send({ message: "Not authenticated!" });
    return;
  }

  try {
    const strSql = 'SELECT * FROM users WHERE id = $1';
    const values = [req.body.userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      if (!user) {
        res.status(404).send({ message: "User not found!" });
        return;
      }
      try {
        const strSql = 'UPDATE users SET info = $1, following_categories = $2, email = $3, email_notifications = $4 WHERE id = $5 RETURNING info, email, following_categories, email_notifications';
        const {body: {newInfo, followingCategories, email, emailNotifications}, userId} = req;
        const values = [newInfo, followingCategories, email, emailNotifications, userId];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          const newData = resQuery.rows[0];
          return res.status(200).send({
            message: "success",
            newInfo: newData.info,
            followingCategories: newData.following_categories,
            email: newData.email,
            emailNotifications: newData.email_notification
          })
        })}
      catch(err) {
        res.status(500).send(err.message);
      }
  })} catch (err) {
    res.status(500).send(err.message);
  }
};