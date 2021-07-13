const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../db");
const { ACCESS_TOKEN_EXPIRES_TIME, REFRESH_TOKEN_EXPIRES_TIME } = require("../utils/constant");

function verifyToken(req, res, next) {
  let token = req.headers["dealbee-at"];
  let refreshToken = req.headers["dealbee-rt"];

  if ((!token || token === "undefined") && (!refreshToken || refreshToken === "undefined")) {
    next();
    return;
    // return res.status(200).send({
    //   message: "No token provided!"
    // });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      if (err.message === "jwt expired") {
        const strSql = `SELECT id FROM users WHERE refresh_token = $1`;
        const values = [refreshToken];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery || !resQuery.rows[0]) 
            return res.status(200).send({ message: "Unauthorized" });
          
          const userId = resQuery.rows[0].id;
          jwt.verify(refreshToken, config.secret, (err, decoded) => {
            if (err) {
              if (err.message === "jwt expired") {
                //generate new token if refresh token expired
                // console.log("generate new refresh token");

                const newRefreshToken = jwt.sign({ id: userId }, config.secret, {
                  expiresIn: REFRESH_TOKEN_EXPIRES_TIME
                });
                const strSql = `UPDATE users SET refresh_token = $1 WHERE id = $2`;
                const values = [newRefreshToken, userId];
                db.query(strSql, values);

                req.userId = userId;
                req.newTokens = {
                  refreshToken: newRefreshToken,
                  accessToken: jwt.sign({ id: userId }, config.secret, {
                    expiresIn: ACCESS_TOKEN_EXPIRES_TIME
                  }),
                }
                next();
                return;
              } else return res.status(200).send({message: "Unauthorized"});
            }
            // console.log("generate new access token");
            req.userId = userId;
            req.newTokens = {
              accessToken: jwt.sign({ id: userId }, config.secret, {
                expiresIn: ACCESS_TOKEN_EXPIRES_TIME
              }),
              refreshToken
            }
            next();
            return;
          })
        });
      } else return res.status(200).send({message: "Unauthorized"}); 
      // return res.status(200).send({
      //   message: err.message === "jwt expired" ? "jwt expired" : "Unauthorized"
      // })
    } else {
      req.userId = decoded.id;
      req.newTokens = {accessToken: token, refreshToken}
      next();
    }
  });
};

function isAdmin(req, res, next) {
  const {userId} = req;
  if (!userId) {
    return res.status(200).send({message: "Require Admin role!"});
  }
  try {
    const strSql = 'SELECT role FROM users WHERE id = $1';
    const values = [userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (!resQuery.rows[0]) res.status(400).send({ message: "Not authorized!" });

      if (resQuery.rows[0].role === "admin") next(); 
      else res.status(400).send({message: "Require Admin role!"});
    });
  } catch (err) {
    res.status(500).send(err.message);
}
};

function hasEditorPermission(req, res, next) {
  const {userId} = req;
  if (!userId) {
    return res.status(200).send({message: "Require Admin or Editor role!"});
  }
  try {
    const strSql = 'SELECT role, editors_categories FROM users WHERE id = $1';
    const values = [userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (!resQuery.rows[0]) res.status(400).send({ message: "Not authorized!" });

      const {role, editors_categories} = resQuery.rows[0];
      if (role === "admin" || role === "editor") {
        req.editorsCategories = role === "admin" ? ["all"] : editors_categories || [];
        next(); 
      }
      else res.status(400).send({message: "Require Admin or Editor role!"});
    });
  } catch (err) {
    res.status(500).send(err.message);
}
};

function hasModeratorPermission(req, res, next) {
  const {userId} = req;
  if (!userId) {
    return res.status(200).send({message: "Require Admin or Moderator role!"});
  }
  try {
    const strSql = 'SELECT role FROM users WHERE id = $1';
    const values = [userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (!resQuery.rows[0]) res.status(400).send({ message: "Not authorized!" });

      const {role} = resQuery.rows[0];
      if (role === "admin" || role === "moderator") next(); 
      else res.status(400).send({message: "Require Admin or Moderator role!"});
    });
  } catch (err) {
    res.status(500).send(err.message);
}
};

function isManager(req, res, next) {
  const {userId} = req;
  if (!userId) {
    return res.status(200).send({message: "Require Admin role!"});
  }
  try {
    const strSql = 'SELECT role FROM users WHERE id = $1';
    const values = [userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (!resQuery.rows[0]) res.status(400).send({ message: "Not authorized!" });
      
      const { role } = resQuery.rows[0];
      if (role === "admin" || role === "moderator" || role === "editor") next(); 
      else res.status(400).send({message: "Require Admin / Moderator / Editor role!"});
    });
  } catch (err) {
    res.status(500).send(err.message);
}
}

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  hasEditorPermission: hasEditorPermission,
  hasModeratorPermission: hasModeratorPermission,
  isManager: isManager,
};
module.exports = authJwt;