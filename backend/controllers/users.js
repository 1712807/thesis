const db = require("../db");
const moment = require("moment");
const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
const { USER_POINTS } = require("../utils/constant");
const { authJwt } = require("../middleware");
const { getLevelName, addNotificationForUserAboutChangeLevel } = require('../utils/common');
const { use } = require("../api/deals");

exports.getCurrentUser = (req, res) => {
  authJwt.verifyToken(req, res, () => { 
    if (req.userId) {
      try {
        const strSql = `SELECT u.*,
                        MAX(coalesce(interaction.count, 0)) as interaction_count,
                        count(c.id) as comments_count,
                        MAX(coalesce(shares.count, 0)) as shares_count,
                        MAX(coalesce(followers.count, 0)) as followers_count,
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
                        GROUP BY u.id, interaction.count, shares.count, followers.count`;
        const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
        const values = [interaction, comments, shares, reputation_score, followers, req.userId];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          const user = resQuery.rows[0];
          if (!user) {
            res.status(404).send({ message: "User Not found." });
            return;
          }
          try {
            const strSql = 'UPDATE users SET last_active_on = $1, refresh_token = $2 WHERE id = $3';
            const currentTime = now();
            const values = [
              currentTime,
              req.newTokens
                ? req.newTokens.refreshToken || user.refresh_token
                : user.refresh_token,
              req.userId
            ];
            db.query(strSql, values, (errQuery, resQuery) => {
              if (errQuery) {
                res.status(500).send(errQuery.message);
                return;
              }
              return res.status(200).send({
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  info: user.info,
                  role: user.role,
                  user_action: {
                    reputation_score: user.reputation_score || 0,
                    comments:  user.comments_count,
                    interaction: user.interaction_count,
                    shares: user.shares_count,
                  },
                  followingDealsId: user.following_deals_id,
                  lastActiveOn: currentTime,
                  joinedAt: user.created_at,
                  followingCategories: user.following_categories,
                  editorsCategories: user.editors_categories,
                  emailNotifications: user.email_notifications,
                  point: user.point,
                },
                newTokens: req.newTokens
              });
            }
          )} catch (err) {
            res.status(500).send(err.message);
          }
      })} catch (err) {
        res.status(500).send(err.message);
      }
    } else {
      return res.status(200).send({});
    }
  })
}

exports.getUser = (req, res) => {
  try {
    const strSql = `SELECT u.*,
                    MAX(coalesce(interaction.count, 0)) as interaction_count,
                    count(c.id) as comments_count,
                    MAX(coalesce(shares.count, 0)) as shares_count,
                    MAX(coalesce(followers.count, 0)) as followers_count,
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
                    WHERE u.username = $6 AND u.blocked_by IS NULL AND c.deleted_mark IS NULL
                    GROUP BY u.id, interaction.count, shares.count, followers.count`;
    const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
    const values = [interaction, comments, shares, reputation_score, followers, req.query.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];
      if (!user) {
        return res.status(200).send({ message: "User Not found." });
      }
      return res.status(200).send({
        message: "success",
        user: {
          id: user.id,
          username: user.username,
          info: user.info,
          role: user.role,
          user_action: {
            reputation_score: user.reputation_score || 0,
            comments:  user.comments_count,
            interaction: user.interaction_count,
            shares: user.shares_count,
          },
          followingDealsId: user.following_deals_id,
          lastActiveOn: user.last_active_on,
          joinedAt: user.created_at,
          point: user.point,
          followingCategories: user.following_categories,
          editorsCategories: user.editors_categories,
        }
      });
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getActiveUsers = (req, res) => {
  try {
    const strSql = `SELECT u.*, MAX(coalesce(shares.count, 0)) as shares_count,
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
                    WHERE u.blocked_by IS NULL AND u.role = 'user'
                    GROUP BY u.id, shares.count
                    ORDER BY point desc
                    LIMIT 10`;
    const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
    const values = [interaction, comments, shares, reputation_score, followers];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const users = resQuery.rows;
      return res.status(200).send(users.map((user) => ({
          id: user.id,
          username: user.username,
          info: user.info,
          followingDealsId: user.following_deals_id,
          postsCount: user.shares_count,
          avatarUrl: "https://images.weserv.nl/?url=dealbee.vn/f/assets/uploads/profile/2-profileavatar.png",
          point: user.point,
      })));
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

exports.updateReputationScore = (req, res) => {
  try {
    const strSql = `UPDATE users
                    SET reputation_score = $1
                    WHERE username = $2 RETURNING username, reputation_score`;
    const {oldPoint, newReputationScore} = req.body.result
    const values = [newReputationScore, req.body.username]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const user = resQuery.rows[0];   
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
                    WHERE u.username = $6 AND u.blocked_by IS NULL AND c.deleted_mark IS NULL
                    GROUP BY u.id`;
        const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
        const values = [interaction, comments, shares, reputation_score, followers, req.body.username];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          const newPoint = resQuery.rows[0].point;
          if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
            addNotificationForUserAboutChangeLevel(oldPoint, newPoint, resQuery.rows[0].id)
          }
          return res.status(200).send({message: 'success', user});
        }
      )} catch (err) {
        res.status(500).send(err.message);
      }
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

exports.updatefollowingDealsId = (req, res) => {
  try {
    const { userId, dealId, status } = req.body;
    const strSql = status ? `UPDATE users
                    SET following_deals_id = array_append(following_deals_id, $1)
                    WHERE id = $2 RETURNING id, following_deals_id`
                    : `UPDATE users
                    SET following_deals_id = array_remove(following_deals_id, $1)
                    WHERE id = $2 RETURNING id, following_deals_id`
    const values = [dealId, userId]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({message: 'success', following_deals_id: resQuery.rows[0].following_deals_id});
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getMyNotifications = (req, res) => {
  const {userId, query: {limit, offset, isOpening}} = req;
  if (isOpening === 'true') {
    try {
      const strSql = "UPDATE notifications SET is_displayed = true WHERE target_user_id = $1";
      const values = [userId];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
      })
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
  try {
    const strSql = `SELECT n.*, u.info AS user_info, d.info AS deal_info, d.status AS deal_status
                    FROM notifications AS n 
                    LEFT JOIN users AS u ON n.user_id = u.id
                    LEFT JOIN deals AS d ON n.deal_id = d.id
                    WHERE target_user_id = $1 
                    ORDER BY n.created_at DESC
                    LIMIT $2 
                    OFFSET $3`;
    const values = [userId, limit, offset];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({
        message: "success",
        notiList: resQuery.rows.filter((item) => !((item.deal_id && !item.deal_info) || (item.user_id && !item.user_info))),
      });
  })} catch (err) {
    res.status(500).send(err.message);
  }
}

exports.markNotiAsRead = (req, res) => {
  try {
    const {body: {id, type}} = req;
    const strSql = "UPDATE notifications SET is_read = true WHERE (id = $1 OR $2 = true) AND target_user_id = $3";
    const values = [id, (type === "all"), req.userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({message: "success"});
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.followUser = (req, res) => {
  try {
    const {body: {followedByUserId, followedUserId}} = req;
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
    const values = [interaction, comments, shares, reputation_score, followers, followedUserId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const oldPoint = resQuery.rows[0].point;
      try {
        const strSql = "INSERT INTO following_users (followed_by_user_id, followed_user_id) VALUES($1, $2) RETURNING followed_by_user_id, followed_user_id";
        const values = [followedByUserId, followedUserId];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          const newFollower = resQuery.rows[0];
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
            const values = [interaction, comments, shares, reputation_score, followers, followedUserId];
            db.query(strSql, values, (errQuery, resQuery) => {
              if (errQuery) {
                res.status(500).send(errQuery.message);
                return;
              }
              const newPoint = resQuery.rows[0].point;
              if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
                addNotificationForUserAboutChangeLevel(oldPoint, newPoint, followedUserId)
              }
              return res.status(200).send(newFollower);
            });
          } catch (err) {
            res.status(500).send(err.message);
          }
        })
      } catch (err) {
        res.status(500).send(err.message);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.unFollowUser = (req, res) => {
  try {
    const {body: {followedByUserId, followedUserId}} = req;
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
    const values = [interaction, comments, shares, reputation_score, followers, followedUserId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const oldPoint = resQuery.rows[0].point;
      try {
        const strSql = "DELETE from following_users WHERE followed_by_user_id = $1 AND followed_user_id = $2 RETURNING followed_by_user_id, followed_user_id";
        const values = [followedByUserId, followedUserId];
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
            const values = [interaction, comments, shares, reputation_score, followers, followedUserId];
            db.query(strSql, values, (errQuery, resQuery) => {
              if (errQuery) {
                res.status(500).send(errQuery.message);
                return;
              }
              const newPoint = resQuery.rows[0].point;
              if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
                addNotificationForUserAboutChangeLevel(oldPoint, newPoint, followedUserId)
              }
              return res.status(200).send(result);
            });
          } catch (err) {
            res.status(500).send(err.message);
          }
        })
      } catch (err) {
        res.status(500).send(err.message);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getFollowerByUsername = (req, res) => {
  try {
    const strSql = `SELECT f.followed_by_user_id 
                    FROM following_users f
                    JOIN users u ON f.followed_user_id = u.id
                    WHERE u.username = $1`;
    const values = [req.query.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getFollowingByUsername = (req, res) => {
  try {
    const strSql = `SELECT f.followed_user_id
                    FROM following_users f
                    JOIN users u ON f.followed_by_user_id = u.id
                    WHERE u.username = $1`;
    const values = [req.query.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getFollowerInfoByUsername = (req, res) => {
  try {
    const strSql = `SELECT u.id, u.info, u.username, u.blocked_by FROM following_users f
                    join users u on u.id = f.followed_by_user_id
                    join users u1 on u1.id = f.followed_user_id
                    WHERE u1.username = $1`;
    const values = [req.query.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getFollowingInfoByUsername = (req, res) => {
  try {
    const strSql = `SELECT u.id, u.info, u.username, u.blocked_by FROM following_users f
                    join users u on u.id = f.followed_user_id
                    join users u1 on u1.id = f.followed_by_user_id
                    WHERE u1.username = $1`;
    const values = [req.query.username];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.sendFeedback = (req, res) => {
  try {
    const strSql = `INSERT INTO feedback (created_at, name, email, type, content) VALUES ($1, $2, $3, $4, $5)`;
    const { body: { name, email, type, content } } = req;
    const values = [now(), name, email, type, content];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) return res.status(500).send(errQuery.message);
      return res.status(200).send({message: "success"});
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
}