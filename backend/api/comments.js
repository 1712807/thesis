const db = require('../db');
const express = require('express');
const route = express.Router();
const { authJwt } = require("../middleware");
const moment = require("moment");
const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
const { addNotification, addNotificationForReportedCommentOwner, addNotificationForOwnerAboutFeaturedComment, addNotificationForCommentOwnerAboutReplying, addNotificationForCommentOwnerAboutLikes } = require('../utils/common');
var bodyParser = require('body-parser');
const verifyDeal = require('../middleware/verifyDeal');
var jsonParser = bodyParser.json();
const { getSlug, getLevelName, addNotificationForUserAboutChangeLevel } = require('../utils/common');
const { USER_POINTS } = require('../utils/constant')

route.post(`/api/dealbee/comment`, [authJwt.verifyToken], async (req, res) => {
      try {
        const strSql = 'INSERT INTO comments(deal_id, content, created_at, updated_at, user_id, parent_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, deal_id, content, created_at, updated_at, user_id, parent_id';
        const values = [
          req.body.dealId,
          req.body.content,
          now(),
          now(),
          req.userId,
          req.body.parentId,
        ];
        const oldPoint = req.body.oldPoint;
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          const comment = resQuery.rows[0];
          if (req.body.ownerId !== req.userId) {
            const notification = {
              targetUserId: req.body.ownerId,
              action: "[your deal][commented]",
              dealId: req.body.dealId,
            }
            addNotification(notification);
          }
          if (req.body.parentId) {
            addNotificationForCommentOwnerAboutReplying(req.userId, req.body.parentId)
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
              res.status(200).send({message: 'success', comment: {...comment, user_point: newPoint} })
            });
          } catch (err) {
            res.status(500).send(err.message);
          }
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

route.get(`/api/dealbee/comment/deal`, [verifyDeal.checkIfDealIsApproved], async (req, res) => {
    try {
        const strSql = `SELECT c.*, u.info AS user_info, u.username as user_username, count(u1.id) as number_of_children, u.role as user_role,
                        MAX(coalesce(interaction.count, 0)) * $1
                        + MAX(coalesce(comments_count.count, 0)) * $2
                        + MAX(coalesce(shares.count, 0)) * $3
                        + MAX(coalesce(u.reputation_score, 0)) * $4
                        + MAX(coalesce(followers.count, 0)) * $5
                        AS user_point
                        from comments AS c JOIN users AS u on c.user_id = u.id
                        LEFT JOIN comments c1 on c1.parent_id = c.id
                        LEFT JOIN users u1 on c1.user_id = u1.id AND u1.blocked_by IS NULL
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
                        where c.deal_id = $6
                            AND c.deleted_mark IS NOT true
                            AND c.parent_id IS NULL
                            AND u.blocked_by IS NULL
                            AND c1.deleted_mark IS NOT true
                        group by c.id, u.id
                        ORDER BY c.created_at DESC 
                        LIMIT $7 OFFSET $8`;
        const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
        const {query: {dealId, limit, offset, slug}} = req;
        const values = [interaction, comments, shares, reputation_score, followers, dealId, limit, offset];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
          }
          const comments = resQuery.rows;
          try {
            const strSql = `SELECT info FROM deals WHERE id = $1`
            const values = [dealId]
            db.query(strSql, values, (errQuery, resQuery) => {
              if (errQuery) {
                res.status(500).send(errQuery.message);
                return;
              }
              const info = resQuery.rows[0].info;
              if (getSlug(info.title) === slug) {
                return res.status(200).send(comments);
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

route.get(`/api/dealbee/comment/children`, jsonParser, async (req, res) => {
  try {
      const strSql = `SELECT c.*, u.id AS user_id, u.info AS user_info, u.username as user_username,
                      MAX(coalesce(interaction.count, 0)) * $1
                      + MAX(coalesce(comments_count.count, 0)) * $2
                      + MAX(coalesce(shares.count, 0)) * $3
                      + MAX(coalesce(u.reputation_score, 0)) * $4
                      + MAX(coalesce(followers.count, 0)) * $5
                      AS user_point, u.role as user_role
                      from comments AS c JOIN users AS u on c.user_id = u.id
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
                      where c.parent_id = $6 and c.deleted_mark IS NOT true and u.blocked_by is null
                      group by c.id, u.id
                      ORDER BY c.created_at DESC 
                      LIMIT $7 OFFSET $8`;
      const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
      const {query: {commentId, limit, offset}} = req;
      const values = [interaction, comments, shares, reputation_score, followers, commentId, limit, offset];
      db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
      }
      return res.status(200).send(resQuery.rows);
      });
  } catch (err) {
      res.status(500).send(err.message);
  }
});

route.delete(`/api/dealbee/comment`, [authJwt.verifyToken], async (req, res) => {
    try {
      const strSql = 'DELETE from comments where id = $1 OR parent_id = $1 returning id, deal_id, user_id';
      const values = [
        req.query.commentId,
      ];
      const oldPoint = req.query.oldPoint;
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        const comment = resQuery.rows[0];
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
          const values = [interaction, comments, shares, reputation_score, followers, comment.user_id];
          db.query(strSql, values, (errQuery, resQuery) => {
            if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
            }
            const newPoint = resQuery.rows[0].point;
            if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
              addNotificationForUserAboutChangeLevel(oldPoint, newPoint, resQuery.rows[0].id)
            }
            res.status(200).send({message: 'success', comment: {...comment, user_point: newPoint} })
          });
        } catch (err) {
          res.status(500).send(err.message);
        }
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
});

route.put(`/api/dealbee/comment`, [authJwt.verifyToken], async (req, res) => {
  try {
    const strSql = 'UPDATE comments SET content = $1, updated_at = $2 where id = $3 returning id, deal_id, content, updated_at, user_id';
      const values = [
        req.body.content,
        now(),
        req.body.commentId,
      ];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        const comment = resQuery.rows[0];
        const { user_id, content, deal_id } = comment;
        if (req.body.isLiked && user_id !== req.body.userId) {
          addNotificationForCommentOwnerAboutLikes(user_id, content.text, deal_id)
        }
        return res.status(200).send({message: 'success', comment});
      });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

route.get(`/api/dealbee/comments`, [authJwt.verifyToken], async (req, res) => {
  try {
      const strSql = 'SELECT * from comments';
      db.query(strSql, (errQuery, resQuery) => {
      if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
      }
      return res.status(200).send(resQuery.rows);
      });
  } catch (err) {
      res.status(500).send(err.message);
  }
});

route.put(`/api/dealbee/reported_comment`, [authJwt.verifyToken], async (req, res) => {
  try {
    const strSql = `UPDATE comments
                    SET is_reported = $1
                    WHERE id = $2 RETURNING id, is_reported`
    const values = [req.body.newIsReported, req.body.id];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({message: "success", comment: resQuery.rows});
    });
  } catch (err) {
    res.status(500).send(err.rows[0]);
  }
})

route.post(`/api/dealbee/reported_comment`, [authJwt.verifyToken], async (req, res) => {
  try {
    const strSql = `INSERT INTO reported_comments(comment_id, user_id, report_content, reported_at, deal_id)
                    VALUES($1, $2, $3, $4, $5)
                    RETURNING comment_id, user_id, report_content, reported_at, deal_id`;
        const values = [
          req.body.commentId,
          req.body.userId,
          req.body.reportContent,
          now(),
          req.body.dealId,
        ];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      addNotificationForReportedCommentOwner(req.body.commentId)
      return res.status(200).send({message: "success", comment: resQuery.rows[0]});
    });
  } catch (err) {
    res.status(500).send(err.rows[0]);
  }
})

route.get("/api/dealbee/comment/user", async (req,res) => {
  try {
    const strSql = `SELECT c.*, d.info AS deal_info FROM comments AS c JOIN deals AS d ON c.deal_id = d.id
                    JOIN users u ON u.id = c.user_id
                    WHERE u.username = $1 AND c.deleted_mark IS NULL
                    ORDER BY created_at DESC
                    LIMIT $2 
                    OFFSET $3`;
    const {query: {username, page, commentsPerPage}} = req;
    const values = [username, commentsPerPage, (page-1)*commentsPerPage];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
  })} catch (err) {
    res.status(500).send(err.message);
  }
})

route.get(`/api/dealbee/reported_comments/deal`, jsonParser, async (req, res) => {
  try {
      const strSql = `SELECT r.*
                      from reported_comments r 
                      join comments c
                      on c.id = r.comment_id
                      where r.deal_id = $1 and array_length(c.is_reported, 1) > 0`;
      const values = [
      req.query.dealId,
      ];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
        }
        const reportedComments = resQuery.rows;
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
              return res.status(200).send(reportedComments);
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

route.put(`/api/dealbee/featured_comment/update`, [authJwt.verifyToken], async (req, res) => {
  try {
    const strSql = `UPDATE comments
                    SET is_featured = $1, featured_by = $2
                    WHERE id = $3 RETURNING id, is_featured, featured_by, deal_id, user_id, content`
    const values = [req.body.status, req.body.userId, req.body.id];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const comment = resQuery.rows[0];
      const { deal_id, user_id, is_featured, content } = comment;
      if (user_id !== req.body.userId) {
        addNotificationForOwnerAboutFeaturedComment(user_id, is_featured, deal_id, content.text);
      }
      return res.status(200).send({message: "success", comment});
    });
  } catch (err) {
    res.status(500).send(err.rows[0]);
  }
})

route.get(`/api/dealbee/featured_comments`, [verifyDeal.checkIfDealIsApproved], async (req, res) => {
  try {
      const strSql = `SELECT c.*, u.info AS user_info, u.username as user_username, count(c1.parent_id) as number_of_children,
                      MAX(coalesce(interaction.count, 0)) * $1
                      + MAX(coalesce(comments_count.count, 0)) * $2
                      + MAX(coalesce(shares.count, 0)) * $3
                      + MAX(coalesce(u.reputation_score, 0)) * $4
                      + MAX(coalesce(followers.count, 0)) * $5
                      AS user_point, u.role as user_role
                      from comments AS c JOIN users AS u on c.user_id = u.id
                      LEFT JOIN comments c1 on c1.parent_id = c.id
                      LEFT JOIN users u1 on c1.user_id = u1.id
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
                      where c.deal_id = $6
                            AND c.deleted_mark IS NOT true
                            AND c.parent_id IS NULL
                            AND u.blocked_by IS NULL
                            AND u1.blocked_by is null
                            AND c.is_featured IS true
                      group by c.id, u.id
                      ORDER BY c.created_at DESC`;
      const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
      const {query: {dealId, slug}} = req;
      const values = [interaction, comments, shares, reputation_score, followers, dealId];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
        }
        const featuredComments = resQuery.rows;
        try {
          const strSql = `SELECT info FROM deals WHERE id = $1`
          const values = [dealId]
          db.query(strSql, values, (errQuery, resQuery) => {
            if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
            }
            const info = resQuery.rows[0].info;
            if (getSlug(info.title) === slug) {
              return res.status(200).send(featuredComments);
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
module.exports = route; 
