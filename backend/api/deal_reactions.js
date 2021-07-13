const db = require('../db');
const express = require('express');
const route = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const { addNotification } = require('../utils/common');
const { authJwt } = require("../middleware");
const verifyDeal = require('../middleware/verifyDeal');
const { getSlug, getLevelName, addNotificationForUserAboutChangeLevel } = require('../utils/common');
const { USER_POINTS } = require("../utils/constant");

route.get(`/api/dealbee/deal/deal_reactions`, [verifyDeal.checkIfDealIsApproved], async (req, res) => {
    try {
      const strSql = 'SELECT * from deal_reactions where deal_id = $1 AND is_liked = $2';
      const values = [
        req.query.dealId,
        req.query.isLiked
      ];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        const likes = resQuery.rows;
        try {
          const strSql = `SELECT info FROM deals WHERE id = $1`
          const values = [req.query.dealId]
          db.query(strSql, values, (errQuery, resQuery) => {
            if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
            }
            const info = resQuery.rows[0].info;
            if (getSlug(info.title) === req.query.slug) {
              return res.status(200).send(likes);
            }
          })
        } catch (err) {
          res.status(500).send(err.message);
        }
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
});
  
route.post(`/api/dealbee/deal/deal_reactions`, [authJwt.verifyToken], async (req, res) => {
    try {
        const strSql = 'INSERT INTO deal_reactions (deal_id, user_id, is_liked) VALUES($1, $2, $3) RETURNING id, deal_id, user_id, is_liked';
        const values = [
        req.body.dealId,
        req.userId,
        req.body.isLiked
        ];
        const oldPoint = req.body.oldPoint;

        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
          }
          const newLike = resQuery.rows[0];
          if (req.body.ownerId !== req.userId) {
            const notification = {
              targetUserId: req.body.ownerId,
              action: "[your deal][liked]",
              dealId: req.body.dealId,
            }
            addNotification(notification);
          }
          try {
            const strSql = `SELECT u.id,
                        count(c.id) * $2
                        + MAX(coalesce(interaction.count, 0)) * $1
                        + MAX(coalesce(shares.count, 0)) * $3
                        + MAX(coalesce(u.reputation_score, 0)) * $4
                        + MAX(coalesce(followers.count, 0))* $5
                        AS point
                        FROM users u 
                        LEFT JOIN comments as c ON c.user_id = u.id
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
                        WHERE u.id = $6 AND u.blocked_by IS NULL AND c.deleted_mark IS NULL
                        GROUP BY u.id`;
            const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
            const values = [interaction, comments, shares, reputation_score, followers, req.userId];
            db.query(strSql, values, (errQuery, resQuery) => {
              if (errQuery) {
                res.status(500).send(errQuery.message);
                return;
              }
              const newPoint = resQuery.rows[0].point;
              if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
                addNotificationForUserAboutChangeLevel(oldPoint, newPoint, resQuery.rows[0].id)
              }
              res.status(200).send({message: 'success', user: {...newLike, point: newPoint} })
            }
          )} catch (err) {
            res.status(500).send(err.message);
          }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

route.delete(`/api/dealbee/deal/deal_reactions`, jsonParser, async (req, res) => {
    try {
        const strSql = 'DELETE from deal_reactions where deal_id = $1 AND user_id = $2 returning id, deal_id, user_id';
        const values = [
        req.query.dealId,
        req.query.userId,
        ];
        const oldPoint = req.query.oldPoint;
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
          }
          const result = resQuery.rows[0];
          try {
            const strSql = `SELECT u.id,
                        count(c.id) * $2
                        + MAX(coalesce(interaction.count, 0)) * $1
                        + MAX(coalesce(shares.count, 0)) * $3
                        + MAX(coalesce(u.reputation_score, 0)) * $4
                        + MAX(coalesce(followers.count, 0))* $5
                        AS point
                        FROM users u 
                        LEFT JOIN comments as c ON c.user_id = u.id
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
                        WHERE u.id = $6 AND u.blocked_by IS NULL AND c.deleted_mark IS NULL
                        GROUP BY u.id`;
            const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
            const values = [interaction, comments, shares, reputation_score, followers, req.query.userId];
            db.query(strSql, values, (errQuery, resQuery) => {
              if (errQuery) {
                res.status(500).send(errQuery.message);
                return;
              }
              const newPoint = resQuery.rows[0].point;
              if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
                addNotificationForUserAboutChangeLevel(oldPoint, newPoint, resQuery.rows[0].id)
              }
              res.status(200).send({message: 'success', user: {...result, point: newPoint} })
            });
          } catch (err) {
            res.status(500).send(err.message);
          }
        
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

route.put(`/api/dealbee/deal/deal_reactions`, jsonParser, async (req, res) => {
  try {
      const strSql = `UPDATE deal_reactions
                      SET is_liked = $3
                      WHERE deal_id = $1 AND user_id = $2 returning id, deal_id, user_id, is_liked`;
      const values = [
      req.body.dealId,
      req.body.userId,
      req.body.isLiked
      ];
      db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
      }
      return res.status(200).send(resQuery.rows[0]);
      });
  } catch (err) {
      res.status(500).send(err.message);
  }
});

module.exports = route; 