const db = require('../../db');
const express = require('express');
const route = express.Router();
const { authJwt } = require("../../middleware");
const { USER_POINTS } = require("../../utils/constant")

route.get(`/api/dealbee/admin/reported_comments`, [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  const {query: {commentsPerPage, page, sortKey}} = req;  
  const limit = commentsPerPage;
  const offset = commentsPerPage*(page - 1);
  try {
    const strSql = `SELECT c.*, d.id, d.info, u.info as owner_info, u.role as owner_role,
                    u.username as owner_username, MAX(coalesce(interaction.count, 0)) as interaction,
                    MAX(coalesce(comments_count.count, 0)) as comments_count,
                    MAX(coalesce(shares.count, 0)) as shares,
                    MAX(coalesce(u.reputation_score, 0)) as reputation_score,
                    MAX(coalesce(followers.count, 0)) as followers,
                    MAX(coalesce(interaction.count, 0)) * $1
                    + MAX(coalesce(comments_count.count, 0)) * $2
                    + MAX(coalesce(shares.count, 0)) * $3
                    + MAX(coalesce(u.reputation_score, 0)) * $4
                    + MAX(coalesce(followers.count, 0)) * $5
                    AS owner_point
                    FROM comments c
                    INNER JOIN deals d on c.deal_id = d.id
                    INNER JOIN users u on c.user_id = u.id
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
                    WHERE array_length(c.is_reported, 1) > 0 AND c.deleted_mark IS NOT true
                    GROUP BY c.id, u.id, d.id
                    ORDER BY
                      CASE WHEN $6 = 'oldest' THEN  c.created_at END,
                      CASE WHEN $6 = 'people_reporting' then array_length(c.is_reported, 1) END DESC
                    LIMIT $7
                    OFFSET $8`;
    const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
    const values = [interaction, comments, shares, reputation_score, followers, sortKey, limit, offset];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({
        message: "success", 
        comments: resQuery.rows.map((item) => ({
          ...item,
          owner_action: {
            interaction: item.interaction,
            comments: item.comments_count,
            reputation_score: item.reputation_score,
            followers: item.followers,
            shares: item.shares,
          }
        })),
      });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

route.get("/api/dealbee/admin/reported_comments/count", [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  try {
    const strSql = "SELECT COUNT(id) FROM comments WHERE array_length(is_reported, 1) > 0 AND deleted_mark IS NOT true";
    db.query(strSql, (errQuery, resQuery) => {
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

route.put('/api/dealbee/admin/reported_comment/mark_deleted', [authJwt.verifyToken, authJwt.isAdmin], async (req, res) => {
  try {
    const strSql = 'UPDATE comments SET deleted_mark = $1 WHERE id = $2 OR parent_id = $2';
    const values = [req.body.status, req.body.commentId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send({message: "success", deals: resQuery.rows});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.put('/api/dealbee/admin/reported_comment/ignore', [authJwt.verifyToken, authJwt.isAdmin], async (req, res) => {
  try {
    const strSql = `UPDATE comments
                    SET is_reported = null
                    WHERE id = $1`;
    const values = [req.body.commentId];
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

route.get(`/api/dealbee/admin/reported_comments/comment_id`, [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  try {
      const strSql = `SELECT r.*, u.info as user_info, u.username FROM reported_comments r
                      JOIN comments c ON c.id = r.comment_id
                      LEFT JOIN users u ON u.id =  r.user_id
                      WHERE r.comment_id = $1 AND r.user_id = ANY (c.is_reported::int[])`;
      const values = [
      req.query.commentId,
      ];
      db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
      }
      return res.status(200).send({
        message: "success",
        list: resQuery.rows
      });
      });
  } catch (err) {
      res.status(500).send(err.message);
  }
});

route.delete(`/api/dealbee/admin/reported_comment`, [authJwt.verifyToken, authJwt.isAdmin], async (req, res) => {
  try {
    const strSql = 'DELETE from reported_comments where comment_id = $1 returning comment_id';
    const values = [
      req.query.commentId,
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


route.get(`/api/dealbee/admin/reported_comments/count_by_user_id`, [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  try {
    const strSql = `SELECT count(r.comment_id) from reported_comments r
                    join comments c on c.id = r.comment_id and c.user_id = $1
                    group by c.user_id`
    const values = [req.query.userId];
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
})

route.get(`/api/dealbee/admin/reported_comment/:commentId`, [authJwt.verifyToken, authJwt.hasModeratorPermission], async (req, res) => {
  const {params: {commentId}} = req;  
  try {
    const strSql = `SELECT c.*, d.id, d.info, u.info as owner_info, u.role as owner_role,
                    u.username as owner_username, MAX(coalesce(interaction.count, 0)) as interaction,
                    MAX(coalesce(comments_count.count, 0)) as comments_count,
                    MAX(coalesce(shares.count, 0)) as shares,
                    MAX(coalesce(u.reputation_score, 0)) as reputation_score,
                    MAX(coalesce(followers.count, 0)) as followers,
                    MAX(coalesce(interaction.count, 0)) * $1
                    + MAX(coalesce(comments_count.count, 0)) * $2
                    + MAX(coalesce(shares.count, 0)) * $3
                    + MAX(coalesce(u.reputation_score, 0)) * $4
                    + MAX(coalesce(followers.count, 0)) * $5
                    AS owner_point
                    FROM comments c
                    INNER JOIN deals d on c.deal_id = d.id
                    INNER JOIN users u on c.user_id = u.id
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
                    WHERE c.id = $6 AND array_length(c.is_reported, 1) > 0 AND c.deleted_mark IS NOT true
                    group by c.id, d.id, u.id`;
    const {interaction, comments, shares, reputation_score, followers} = USER_POINTS;
    const values = [interaction, comments, shares, reputation_score, followers, commentId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const comment = resQuery.rows[0];
      return res.status(200).send({
        message: "success", 
        comment: {...comment, owner_action: {
          interaction: comment.interaction,
          comments: comment.comments_count,
          reputation_score: comment.reputation_score,
          followers: comment.followers,
          shares: comment.shares,
        }}
      });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = route; 