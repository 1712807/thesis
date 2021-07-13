const db = require('../../db');
const express = require('express');
const route = express.Router();
const { authJwt } = require("../../middleware");
const { addNotification, addNotificationForUserFollowingDeal, addNotificationForUserFollowingCategory, addNotificationForAllUserFollowingUser, getLevelName, addNotificationForUserAboutChangeLevel } = require('../../utils/common');
const moment = require("moment");
const verifyDeal = require('../../middleware/verifyDeal');
const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
const { USER_POINTS } = require("../../utils/constant")

route.post("/api/dealbee/category", [authJwt.verifyToken, authJwt.isAdmin], async (req, res) => {
  try {
    const strSql = "INSERT INTO categories (key, label) VALUES ($1, $2)";
    const { body: { value, label } } = req;
    const values = [value, label];
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
})

route.get("/api/dealbee/admin/deals/count", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const {query: {status, viewed, category}, userId, editorsCategories} = req;
    const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
    if (category !== "all" && !hasPermissionOnAllCategories && editorsCategories.indexOf(category) < 0) {
      return res.status(200).send({count: 0});
    }
    const strSql = `SELECT COUNT(id) 
                    FROM deals LEFT JOIN viewed_before_reviewed ON (id = deal_id AND editor_id = $6)
                    WHERE status = $1 
                      AND (
                        CASE
                          WHEN $2 = 'viewed' THEN editor_id IS NOT NULL
                          WHEN $2 = 'not_viewed' THEN editor_id IS NULL
                          ELSE (editor_id IS NULL OR editor_id IS NOT NULL)
                        END
                      )
                      AND (category = $3 OR $3 = 'all')
                      AND (category = ANY ($4::varchar[]) OR $5 = true)`;
    const values = [status, viewed, category, editorsCategories, hasPermissionOnAllCategories, userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows[0]);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get(`/api/dealbee/admin/deals`, [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {query: {status, limit, page, category, sortKey, viewed}, editorsCategories} = req; 
  const offset = limit*(page - 1);
  const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
  if (category !== "all" && !hasPermissionOnAllCategories && editorsCategories.indexOf(category) < 0) {
    return res.status(200).send({message: "success", deals: []});
  } 
  try {
    const strSql = `
      SELECT 
        d.*, 
        v.*, 
        u.username, u.info AS user_info, u.role AS user_role, u.blocked_by as user_blocked,
        u.info as user_info, u.role as user_role,
        MAX(coalesce(interaction.count, 0)) as interaction,
        MAX(coalesce(comments_count.count, 0)) as comments_count,
        MAX(coalesce(shares.count, 0)) as shares,
        MAX(coalesce(u.reputation_score, 0)) as reputation_score,
        MAX(coalesce(followers.count, 0)) as followers,
        MAX(coalesce(interaction.count, 0)) * $10
        + MAX(coalesce(comments_count.count, 0)) * $11
        + MAX(coalesce(shares.count, 0)) * $12
        + MAX(coalesce(u.reputation_score, 0)) * $13
        + MAX(coalesce(followers.count, 0)) * $16
        AS user_point
      FROM 
        deals AS d LEFT JOIN viewed_before_reviewed AS v ON (d.id = v.deal_id AND v.editor_id = $1)
        LEFT JOIN users AS u ON (d.user_id = u.id)
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
      WHERE status = $2
        AND (category = $3 OR $4 = true)
        AND (category = ANY ($14::varchar[]) OR $15 = true)
        AND ($6 = true OR 
          CASE
            WHEN $5 = 'viewed' THEN v.deal_id IS NOT NULL
            ELSE v.deal_id IS NULL 
          END
        )
      GROUP BY u.id, d.id, v.editor_id, v.deal_id
      ORDER BY
        v.editor_id DESC NULLS FIRST,
        u.blocked_by ->> 'id' NULLS FIRST,
        CASE WHEN $7 = 'latest' THEN
          CASE WHEN $2 = 'waiting' THEN d.created_at ELSE d.last_reviewed_at END
        END DESC,
        CASE WHEN $7 = 'to_expired' THEN d.expired_at END ASC NULLS LAST,
        CASE WHEN $7 = 'most_reputed' THEN u.reputation_score END DESC NULLS LAST
      LIMIT $8
      OFFSET $9`;
    const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
    const values = [
      req.userId, 
      status, 
      category, 
      category === "all", 
      viewed, 
      viewed === "all", 
      sortKey, 
      limit, 
      offset,
      interaction, 
      comments, 
      shares, 
      reputation_score,
      editorsCategories, 
      hasPermissionOnAllCategories,
      followers
    ];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({
        message: "success", 
        deals: resQuery.rows.map((item) => ({
          ...item, 
          viewed: item.editor_id ? true : false,
          user_action: {
            interaction: item.interaction,
            comments: item.comments_count,
            reputation_score: item.reputation_score,
            followers: item.followers,
            shares: item.shares,
          }
        }))
      });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put('/api/dealbee/admin/deal/review', [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {body: {prevStatus, status, category, prevCategory, info, isFeatured, editorsNote, id, expiredDate, expired}, userId, editorsCategories} = req;
  const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
  const hasPermissionOnCurrentCategory = hasPermissionOnAllCategories || editorsCategories.indexOf(category) >= 0;
  const hasPermissionOnPrevCategory = hasPermissionOnAllCategories || editorsCategories.indexOf(prevCategory) >= 0;
  if (req.userId !== req.body.editorId || !hasPermissionOnPrevCategory) {
    res.status(500).send({message: "Not authorized!"});
    return;
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
    const values = [interaction, comments, shares, reputation_score, followers, req.body.userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const oldPoint = resQuery.rows[0].point;
      try {
        const strSql = `UPDATE deals 
                        SET 
                          status = $1, 
                          category = $2, 
                          info = $3, 
                          last_reviewed_by = $4, 
                          last_reviewed_at = $5, 
                          featured = $6, 
                          editors_note = $7, 
                          expired_at = $9,
                          expired = $10
                        WHERE id = $8 
                        RETURNING user_id`;
        const newStatus = !hasPermissionOnCurrentCategory && status === "approved"
          ? "waiting" 
          : status;
        // const newCategory = !hasPermissionOnCurrentCategory && newStatus === "approved" 
        //   ? category || "others"
        //   : prevCategory || "others";
        const newCategory = category || "others";
        const values = [
          newStatus, 
          newCategory, 
          info, userId, now(), isFeatured, {content: editorsNote, editorId: userId}, id, expiredDate ? moment(expiredDate).format("YYYY-MM-DD HH:mm:ss") : null, expired
        ];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          const ownerId = resQuery.rows[0].user_id;
          if (newStatus !== "waiting") {
            if (ownerId !== userId) {
              const notification = {
                targetUserId: ownerId,
                dealId: id,
                action: `[your deal][reviewed][${prevStatus === "approved" ? "deleted" : newStatus}]`
              }
              addNotification(notification);
            }
            addNotificationForUserFollowingDeal(id, `[your following deal][${status}]`)
            if (newStatus === 'approved' ) {
              addNotificationForAllUserFollowingUser(ownerId, id)
              addNotificationForUserFollowingCategory(newCategory, {info, id})
            }
            if (newStatus === "approved" || prevStatus === "approved"){
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
                const values = [interaction, comments, shares, reputation_score, followers, ownerId];
                db.query(strSql, values, (errQuery, resQuery) => {
                  if (errQuery) {
                    res.status(500).send(errQuery.message);
                    return;
                  }
                  const newPoint = resQuery.rows[0].point;
                  if (getLevelName(oldPoint) !== getLevelName(newPoint)) {
                    addNotificationForUserAboutChangeLevel(oldPoint, newPoint, resQuery.rows[0].id)
                  }
                }
              )} catch (err) {
                res.status(500).send(err.message);
              }
            }       
          }      
          return res.status(200).send({message: "success"});
        });
      } catch (err) {
        res.status(500).send(err.message);
    }
    }
  )} catch (err) {
    res.status(500).send(err.message);
  }
})

route.put('/api/dealbee/admin/deal/edit', [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {body: {info, category, prevCategory, isFeatured, editorsNote, id, expiredDate, expired}, userId, editorsCategories} = req;
  const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
  if (req.userId !== req.body.editorId || (!hasPermissionOnAllCategories && (editorsCategories.indexOf(category) < 0 || editorsCategories.indexOf(prevCategory) < 0))) {
    res.status(500).send({message: "Not authorized!"});
    return;
  }
  try {
    const strSql = 'UPDATE deals SET info = $1, category = $2, last_edited_by = $3, featured = $4, editors_note = $5, expired_at = $7, expired = $8 WHERE id = $6 RETURNING *';
    const values = [info, category, userId, isFeatured, {content: editorsNote, editorId: req.userId}, id, expiredDate ? moment(expiredDate).format("YYYY-MM-DD HH:mm:ss") : null, expired];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const ownerId = resQuery.rows[0].user_id;
      if (ownerId !== userId) {
        const notification = {
          targetUserId: ownerId,
          action: "[your deal][edited]",
          dealId: id,
        }
        addNotification(notification);
      }
      addNotificationForUserFollowingDeal(id, '[your following deal][info][edited]')
      return res.status(200).send({message: "success"});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.post("/api/dealbee/admin/deal/viewed", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {body: {editorId, dealId}} = req;
  if (req.userId !== editorId) {
    res.status(500).send({message: "Not authorized!"});
    return;
  }
  try { 
    const strSql = "SELECT * FROM deals WHERE id = $1";
    const values = [dealId];
    db.query(strSql, values, (err, resQuery) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      if (!resQuery.rows[0]) {
        res.status(500).send({message: "Deal not found!"});
      }
      try {
        const values = [req.userId, dealId];
        try {
          const strSql = "SELECT * FROM viewed_before_reviewed WHERE editor_id = $1 AND deal_id = $2";
          db.query(strSql, values, (err, resQuery) => {
            if (err) {
              res.status(500).send(err.message);
              return;
            }
            if (resQuery.rows[0]) {
              return res.status(200).send({message: "success"});
            }
            try {
              const strSql = 'INSERT INTO viewed_before_reviewed (editor_id, deal_id) VALUES ($1, $2)';
              db.query(strSql, values, (err, resQuery) => {
                if (err) {
                  res.status(500).send(err.message);
                  return;
                }
                return res.status(200).send({message: "success"});
              });
            } catch (err) {
              res.status(500).send(err.message);
            }
            
          });
        } catch (err) {
          res.status(500).send(err.message);
        }
      } catch (err) {
        res.status(500).send(err.message);
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/admin/reported_deals/count", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {query: {category}, editorsCategories} = req;
  const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
  if (category !== "all" && !hasPermissionOnAllCategories && editorsCategories.indexOf(category) < 0) {
    return res.status(200).send({count: 0});
  }
  try {
    const strSql = `SELECT r.deal_id 
                    FROM reported_deals AS r 
                      JOIN deals AS d on r.deal_id = d.id
                    WHERE (d.category = $1 OR $1 = 'all')
                    AND (d.category = ANY ($2::varchar[]) OR $3 = true)
                    GROUP BY r.deal_id`;
    const values = [category, editorsCategories, hasPermissionOnAllCategories];
    db.query(strSql, values, (err, resQuery) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      return res.status(200).send({count: resQuery.rows.length});
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
})

route.get("/api/dealbee/admin/reported_deals", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {query: {limit, page, category, sortKey}, editorsCategories} = req;  
  const offset = limit*(page - 1);
  const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
  const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
  try {
    const strSql = `SELECT d.*, COUNT(u.id) AS times, u.info as user_info, u.role as user_role, u.blocked_by as user_blocked,
                    MAX(coalesce(interaction.count, 0)) as interaction,
                    MAX(coalesce(comments_count.count, 0)) as comments_count,
                    MAX(coalesce(shares.count, 0)) as shares,
                    MAX(coalesce(u.reputation_score, 0)) as reputation_score,
                    MAX(coalesce(followers.count, 0)) as followers,
                    MAX(coalesce(interaction.count, 0)) * $1
                    + MAX(coalesce(comments_count.count, 0)) * $2
                    + MAX(coalesce(shares.count, 0)) * $3
                    + MAX(coalesce(u.reputation_score, 0)) * $4
                    + MAX(coalesce(followers.count, 0)) * $11
                      AS user_point
                    FROM reported_deals AS r 
                      JOIN deals AS d ON r.deal_id = d.id
                      JOIN users AS u ON u.id = d.user_id
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
                    WHERE d.expired IS NOT true
                          AND (category = $5 OR $5 = 'all')
                          AND (category = ANY ($9::varchar[]) OR $10 = true)
                    GROUP BY r.deal_id, d.id, u.id
                    ORDER BY
                      CASE WHEN $8 = 'oldest' THEN  d.created_at END,
                      CASE WHEN $8 = 'people_reporting' then COUNT(u.id) END DESC
                    LIMIT $6
                    OFFSET $7`;
    const values = [
      interaction, 
      comments, 
      shares, 
      reputation_score, 
      category, 
      limit, 
      offset, 
      sortKey,
      editorsCategories,
      hasPermissionOnAllCategories,
      followers
    ];

    db.query(strSql, values, (err, resQuery) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      return res.status(200).send({
        message: "success",
        deals: resQuery.rows
      });
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
})

route.get("/api/dealbee/admin/reported_deal", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {query: {dealId}, editorsCategories} = req;  
  const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
  const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
  try {
    const strSql = `SELECT d.*, COUNT(u.id) AS times, u.info as user_info, u.role as user_role, u.blocked_by as user_blocked,
                    MAX(coalesce(interaction.count, 0)) as interaction,
                    MAX(coalesce(comments_count.count, 0)) as comments_count,
                    MAX(coalesce(shares.count, 0)) as shares,
                    MAX(coalesce(u.reputation_score, 0)) as reputation_score,
                    MAX(coalesce(followers.count, 0)) as followers,
                    MAX(coalesce(interaction.count, 0)) * $1
                    + MAX(coalesce(comments_count.count, 0)) * $2
                    + MAX(coalesce(shares.count, 0)) * $3
                    + MAX(coalesce(u.reputation_score, 0)) * $4
                    + MAX(coalesce(followers.count, 0)) * $8
                      AS user_point
                    FROM reported_deals AS r 
                      JOIN deals AS d ON r.deal_id = d.id
                      JOIN users AS u ON u.id = d.user_id
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
                    WHERE d.id = $5 AND (d.category = ANY($6::varchar[]) or $7 = true)
                    GROUP BY r.deal_id, d.id, u.id`;
    const values = [
      interaction, 
      comments, 
      shares, 
      reputation_score, 
      dealId,
      editorsCategories,
      hasPermissionOnAllCategories,
      followers
    ];

    db.query(strSql, values, (err, resQuery) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      return res.status(200).send(resQuery.rows[0]);
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
})

route.get("/api/dealbee/admin/reported_deal/users", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const strSql = `SELECT r.*, u.info AS user_info, u.username
                    FROM reported_deals AS r 
                      JOIN users AS u ON r.user_id = u.id
                    WHERE r.deal_id = $1`
    const values = [req.query.dealId];
    db.query(strSql, values, (err, resQuery) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      return res.status(200).send({
        message: "success",
        list: resQuery.rows
      });
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.delete("/api/dealbee/admin/reported_deal", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const strSql = "DELETE FROM reported_deals WHERE deal_id = $1";
    const values = [req.query.dealId];
    db.query(strSql, values, (err, resQuery) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      return res.status(200).send({
        message: "success",
      });
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get(`/api/dealbee/admin/deal/reported_expired`, [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  const {query: {limit, page, category, sortKey}} = req;  
  const offset = limit*(page - 1);
  const {interaction, comments, shares, reputation_score} = USER_POINTS;
  try {
    const strSql = `SELECT d.*, u.info as user_info, u.user_action, u.role as user_role,
                    check_null(CAST(u.user_action ->> 'interaction'AS double precision)) * $1
                    + check_null(CAST(u.user_action ->> 'comments'AS double precision)) * $2
                    + check_null(CAST(u.user_action ->> 'shares'AS double precision)) * $3
                    + check_null(CAST(u.user_action ->> 'reputation_score'AS double precision)) * $4
                    AS user_point FROM deals as d
                    JOIN users as u
                    ON u.id = d.user_id
                    WHERE array_length(d.is_reported, 1) > 0
                          AND d.expired IS NOT true
                          AND (category = $5 OR $5 = 'all')
                    ORDER BY
                      CASE WHEN $8 = 'oldest' THEN  d.created_at END,
                      CASE WHEN $8 = 'people_reporting' then array_length(d.is_reported, 1) END DESC
                    LIMIT $6
                    OFFSET $7`;
    const values = [interaction, comments, shares, reputation_score, category, limit, offset, sortKey];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({
        message: "success", 
        deals: resQuery.rows
      });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

route.get("/api/dealbee/admin/deal/reported_expired/count", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const strSql = `SELECT COUNT(id)
                    FROM deals
                    WHERE array_length(is_reported, 1) > 0 
                          AND expired IS NOT true
                          AND (category = $1 OR $1 = 'all')`;
    const values = [req.query.category]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows[0]);
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put('/api/dealbee/admin/expired_deal_update', [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const strSql = `UPDATE deals 
                    SET expired = $1 
                    WHERE id = $2 AND (category = $3 OR $4 = true) 
                    RETURNING id, user_id, expired`;
    const {body: {status, dealId}, editorsCategories} = req;
    const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
    const values = [status, dealId, editorsCategories, hasPermissionOnAllCategories];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deal = resQuery.rows[0];
      if (!deal) {
        res.status(500).end();
        return;
      }
      const notification = {
        targetUserId: deal.user_id,
        dealId: deal.id,
        action: "[your deal][expired]"
      }
      addNotification(notification);
      addNotificationForUserFollowingDeal(deal.id, '[your following deal][expired]')
      return res.status(200).send({message: "success", deals: resQuery.rows});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put('/api/dealbee/admin/reported_deal/ignore', [authJwt.verifyToken, authJwt.isAdmin], async (req, res) => {
  try {
    const strSql = `UPDATE deals
                    SET is_reported = null
                    WHERE id = $1`;
    const values = [req.body.dealId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({message: "success"});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put("/api/dealbee/admin/deal/editors_note", [authJwt.verifyToken, authJwt.hasEditorPermission, verifyDeal.checkIfDealExisted], async (req, res) => {
  try {
    const {body: {dealId, note}, userId, editorsCategories} = req;
    const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
    const strSql = `UPDATE deals
                    SET editors_note = $1
                    WHERE id = $2 
                      AND (category = ANY ($3::varchar[]) OR $4 = true)
                    RETURNING user_id`;
    const values = [{content: note, editorsId: userId}, dealId, editorsCategories, hasPermissionOnAllCategories];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (!resQuery.rows[0]) {
        res.status(500).end();
        return;
      }
      const ownerId = resQuery.rows[0].user_id;
      if (userId !== ownerId) {
        const notification = {
          targetUserId: ownerId,
          dealId,
          action: "[your deal][edited]"
        }
        addNotification(notification);
      }
      addNotificationForUserFollowingDeal(dealId, '[your following deal][info][edited]')
      return res.status(200).send({message: "success"});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.delete("/api/dealbee/admin/deal/editors_note", [authJwt.verifyToken, authJwt.hasEditorPermission, verifyDeal.checkIfDealExisted], async (req, res) => {
  try {
    const {query: {dealId}, userId, editorsCategories} = req;
    const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
    const strSql = `UPDATE deals
                    SET editors_note = NULL, last_edited_by = $2
                    WHERE id = $1 
                      AND (category = ANY ($3::varchar[]) OR $4 = true)
                    RETURNING user_id`;
    const values = [dealId, userId, editorsCategories, hasPermissionOnAllCategories];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const ownerId = resQuery.rows[0].user_id;
      if (userId !== ownerId) {
        const notification = {
          targetUserId: ownerId,
          dealId,
          action: "[your deal][edited]"
        }
        addNotification(notification);
      }
      addNotificationForUserFollowingDeal(dealId, '[your following deal][editorNote][deleted]')
      return res.status(200).send({message: "success"});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put("/api/dealbee/admin/deal/featured_mark", [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const {body: {dealId, isFeatured}, editorsCategories} = req;
    const hasPermissionOnAllCategories = editorsCategories.length === 1 && editorsCategories[0] === "all";
    const strSql = `UPDATE deals
                    SET featured = $1
                    WHERE id = $2 
                      AND (category = ANY ($3::varchar[]) OR $4 = true)
                    RETURNING id`;
    const values = [isFeatured, dealId, editorsCategories, hasPermissionOnAllCategories];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (!resQuery.rows[0]) {
        res.status(500).end();
        return;
      }
      return res.status(200).send({message: "success"});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

module.exports = route; 