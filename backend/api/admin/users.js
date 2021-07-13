const db = require('../../db');
const express = require('express');
const route = express.Router();
const { authJwt } = require("../../middleware");
const { USER_POINTS, EMAIL_TYPES } = require("../../utils/constant");
const { sendEmail } = require('../../middleware/emailService');
const { addNotification } = require('../../utils/common');

route.get("/api/dealbee/admin/users/count", [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  try {
    const strSql = `SELECT COUNT(id) FROM users`;
    const values = [];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({
        message: "success",
        ...resQuery.rows[0],
      });
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/admin/users", [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
    try {
        const strSql = `SELECT u.*, MAX(coalesce(interaction.count, 0)) * $1
                        + MAX(coalesce(comments_count.count, 0)) * $2
                        + MAX(coalesce(shares.count, 0)) * $3
                        + MAX(coalesce(u.reputation_score, 0)) * $4
                        + MAX(coalesce(followers.count, 0)) * $5
                        AS user_point
                        FROM users u
                        LEFT JOIN 
                          (SELECT cmt.user_id, count(cmt.id)
                            FROM comments cmt WHERE cmt.deleted_mark IS NOT true
                            GROUP BY cmt.user_id)
                        AS comments_count ON comments_count.user_id = u.id
                        LEFT JOIN
                          (SELECT d.user_id, count(d.id)
                          FROM deals d WHERE d.status = 'approved'
                          GROUP BY d.user_id)
                        AS shares ON shares.user_id = u.id
                        LEFT JOIN
                          (SELECT r.user_id, count(r.id)
                          FROM deal_reactions r
                          GROUP BY r.user_id)
                        AS interaction ON interaction.user_id = u.id
                        LEFT JOIN
                          (SELECT f.followed_user_id as user_id, count(f.followed_by_user_id)
                          FROM following_users f
                          GROUP BY f.followed_user_id)
                        AS followers ON followers.user_id = u.id
                        group by u.id 
                        ORDER BY created_at DESC`;
        const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
        const values = [interaction, comments, shares, reputation_score, followers];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          return res.status(200).send(resQuery.rows.map((user) => ({
            created_at: user.created_at,
            email: user.email,
            id: user.id,
            info: user.info,
            role: user.role,
            score: user.score,
            username: user.username,
            status: user.blocked_by ? "blocked" : "active",
            blockedReason: user.blocked_by ? user.blocked_by.reason : "",
            point: user.user_point,
            editorsCategories: user.editors_categories,
          })));
        })
      } catch (err) {
        res.status(500).send(err.message);
      }
})

route.put("/api/dealbee/admin/users/block", [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  try {
    const { body: { id, isBlocking, reason }, userId } = req;
      const strSql = "UPDATE users SET blocked_by = $1, refresh_token = $2 WHERE id = $3 RETURNING username, email, info";
      const values = [isBlocking ? {id: userId, reason: reason} : null, null, id];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        if (!resQuery.rows[0]) return res.status(500).end();
        const { username, email, info: { displayName } } = resQuery.rows[0];
        sendEmail([{email, displayName}], isBlocking ? EMAIL_TYPES.accountBlocked : EMAIL_TYPES.accountUnblocked, {reason, account: {username}})
        return res.status(200).send({message: "success"});
      })
    } catch (err) {
      res.status(500).send(err.message);
    }
})

route.put("/api/dealbee/admin/user/role", [authJwt.verifyToken, authJwt.isAdmin], async (req, res) => {
  try {
      const strSql = "UPDATE users SET role = $1, editors_categories = $2 WHERE id = $3 AND blocked_by IS NULL";
      const {body: {role, categories, userId}} = req;
      const values = [role, categories, userId];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        addNotification({
          targetUserId: userId,
          action: `[role changed][${role}]`,
        })
        return res.status(200).send({message: "success"});
      })
    } catch (err) {
      res.status(500).send(err.message);
    }
})

route.get("/api/dealbee/admin/feedbacks", [authJwt.verifyToken, authJwt.isManager], async (req, res) => {
  try {
    const strSql = "SELECT * FROM feedback";
    db.query(strSql, [], (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put("/api/dealbee/admin/feedback/solve", [authJwt.verifyToken, authJwt.isManager], async (req, res) => {
  try {
    const strSql = "UPDATE feedback SET solved_by = $1 WHERE id = $2";
    const { userId, body: { id } } = req;
    db.query(strSql, [userId, id], (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({message: "success"});
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

module.exports = route;