const db = require('../db');
const express = require('express');
const route = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const { authJwt } = require("../middleware");
const moment = require("moment");
const verifyDeal = require('../middleware/verifyDeal');
const { getSlug, addNotificationForAdminAndEditor } = require('../utils/common');
const now = () => moment().format('YYYY-MM-DD HH:mm:ss');

route.get('/api/dealbee/categories', async (req, res) => {
  try {
    const strSql = 'SELECT * FROM categories';
    db.query(strSql, [], (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.post(`/api/dealbee/deal`, [authJwt.verifyToken], async (req, res) => {
  if (req.userId !== req.body.userId) {
    res.status(500).send({message: "Not authorized!"});
    return;
  }
  try {
    const { userId, body: { content, expiredDate } } = req;
    const category = req.body.category || "others";
    const strSql = `SELECT role, editors_categories FROM users WHERE id = $1`;
    db.query(strSql, [userId], (errQuery, resQuery) => {
      const { role, editors_categories: categories } = resQuery.rows[0];
      const status = (
        (
          role === "admin"
        ) || (
          role === "editor" && (
            (categories.length === 1 && categories[0] === "all")
            || (categories.indexOf(category) >= 0)
          )
        )
      ) ? "approved" : "waiting";

      const strSql = 'INSERT INTO deals (info, user_id, status, created_at, category, expired_at, last_reviewed_at, last_reviewed_by) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, info';
      const values = [
        content,
        userId,
        // "waiting",
        status,
        now(),
        category,
        expiredDate ? moment(expiredDate).format("YYYY-MM-DD HH:mm:ss") : null,
        status === "approved" ? now() : null,
        status === "approved" ? userId : null,
      ];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        if (status === "waiting")
          addNotificationForAdminAndEditor(null, category === "others" ? "all" : category, "[new pending deal]");
        return res.status(200).send({
          status,
          newDeal: resQuery.rows[0]
        });
      });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})
  
  

route.delete(`/api/dealbee/pending_deal`, [authJwt.verifyToken], async (req, res) => {
  try {
    const {query: {dealId, userId}} = req;
    if (parseInt(userId) !== req.userId) {
      res.status(500).send({message: "Not authorized!"});
      return;
    }
    const strSql = 'DELETE FROM deals WHERE id = $1 AND status = $2 AND user_id = $3';
    const values = [dealId, "waiting", userId];
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

route.put(`/api/dealbee/pending_deal`, [authJwt.verifyToken], async (req, res) => {
  try {
    const {body: {dealId, userId, info, category, preCategory, expiredDate}} = req;
    if (userId !== req.userId) {
      res.status(500).send({message: "Not authorized!"});
      return;
    }
    const strSql = 'UPDATE deals SET info = $1, category = $2, expired_at = $6 WHERE id = $3 AND user_id = $4 AND status = $5 RETURNING id, info, category, expired_at';
    const values = [info, category, dealId, userId, "waiting", expiredDate ? moment(expiredDate).format("YYYY-MM-DD HH:mm:ss") : null];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      if (preCategory !== category && category !== "others") {
        addNotificationForAdminAndEditor(null, category, "[new pending deal]", true)
      }
      return res.status(200).send({message: "success", ...resQuery.rows[0]});
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/featured_deals", jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, COUNT(c.id) AS comments_count, res.likes_count
                    FROM deals AS d LEFT JOIN (
                        comments AS c
                        JOIN users AS u ON u.id = c.user_id
                      ) ON d.id = c.deal_id
                    LEFT JOIN
                      (SELECT r.deal_id, count(r.id) AS likes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE status = 'approved' 
                      AND featured = true 
                      AND (expired_at IS NULL OR expired_at >= $1)
                      AND (expired IS NOT true)
                      AND (category = $2 OR $3 = true)
                      AND c.deleted_mark IS NULL
                      AND u.blocked_by IS NULL
                    GROUP BY d.id, res.likes_count
                    ORDER BY d.last_reviewed_at
                    LIMIT $4
                    OFFSET $5`;
    const {query: {offset, limit, category}} = req;
    const values = [now(), category, category === 'all', limit, offset]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows;
      return res.status(200).send(deals.map((item) => (
        {
          ...item,
          interaction: {
            views: item.views || 0,
            comments: item.comments_count,
            likes: item.likes_count || 0
          }
        }
      )));
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/hot_deals", jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, 
                      CAST(d.info ->> 'discount' AS int) AS discount_percentage,
                      COUNT(c.id) AS comments_count, res.likes_count
                    FROM deals AS d LEFT JOIN (
                        comments AS c
                        JOIN users AS u ON u.id = c.user_id
                      ) ON d.id = c.deal_id
                    LEFT JOIN
                      (SELECT r.deal_id, count(r.id) AS likes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE status = 'approved' 
                      AND (expired_at IS NULL OR expired_at >= $1)
                      AND (expired IS NOT true)
                      AND (category = $2 OR $3 = true)
                      AND c.deleted_mark IS NULL
                      AND u.blocked_by IS NULL
                    GROUP BY d.id, res.likes_count
                    ORDER BY discount_percentage DESC, id ASC
                    LIMIT $4
                    OFFSET $5`;
    const {query: {offset, limit, category}} = req;
    const values = [now(), category, category === 'all', limit, offset]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows;
      return res.status(200).send(deals.map((item) => (
        {
          ...item,
          interaction: {
            views: item.views || 0,
            comments: item.comments_count,
            likes: item.likes_count || 0
          }
        }
      )));
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/flash_deals", jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT * FROM deals 
                    WHERE status = 'approved' 
                      AND expired_at >= $1
                      AND (expired IS NOT true)
                      AND (category = $2 OR $3 = true)
                    ORDER BY expired_at, id ASC
                    LIMIT $4`;
    const {query: {category, limit}} = req;
    const values = [now(), category, category === 'all', limit]
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
})

route.get("/api/dealbee/popular_deals", jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, 
                      MAX(coalesce(d.views, 0))
                      + MAX(coalesce(res.likes_count, 0))*2
                      + MAX(coalesce(res.dislikes_count, 0))*(-1)
                      + COUNT(c.id)*3
                      AS popular_score,
                      COUNT(c.id) AS comments_count, res.likes_count
                    FROM deals AS d LEFT JOIN (
                        comments AS c
                        JOIN users AS u ON u.id = c.user_id
                      ) ON d.id = c.deal_id
                    LEFT JOIN
                      (SELECT r.deal_id,
                        COUNT(r.id) FILTER (WHERE r.is_liked IS TRUE) AS likes_count,
                        COUNT(r.id) FILTER (WHERE r.is_liked IS FALSE) AS dislikes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE status = 'approved' 
                      AND (expired_at IS NULL OR expired_at >= $1)
                      AND (expired IS NOT true)
                      AND (category = $2 OR $3 = true)
                      AND c.deleted_mark IS NULL
                      AND u.blocked_by IS NULL
                    GROUP BY d.id, res.likes_count
                    ORDER BY popular_score DESC
                    LIMIT $4
                    OFFSET $5`;
    const {query: {offset, limit, category}} = req;
    const values = [now(), category, category === 'all', limit, offset]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows;
      return res.status(200).send(deals.map((item) => (
        {
          ...item,
          interaction: {
            views: item.views || 0,
            comments: item.comments_count,
            likes: item.likes_count || 0
          }
        }
      )));
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/recent_deals", jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, COUNT(c.id) AS comments_count, res.likes_count
                    FROM deals AS d LEFT JOIN (
                        comments AS c
                        JOIN users AS u ON u.id = c.user_id
                      ) ON d.id = c.deal_id
                    LEFT JOIN
                      (SELECT r.deal_id, count(r.id) AS likes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE status = 'approved' 
                      AND (expired_at IS NULL OR expired_at >= $1)
                      AND (expired IS NOT true)
                      AND (category = $2 OR $3 = true)
                      AND c.deleted_mark IS NULL
                      AND u.blocked_by IS NULL
                    GROUP BY d.id, res.likes_count
                    ORDER BY last_reviewed_at DESC NULLS LAST
                    LIMIT $4
                    OFFSET $5`;
    const {query: {offset, limit, category}} = req;
    const values = [now(), category, category === 'all', limit, offset]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows;
      return res.status(200).send(deals.map((item) => (
        {
          ...item,
          interaction: {
            views: item.views || 0,
            comments: item.comments_count,
            likes: item.likes_count || 0
          }
        }
      )));
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/best_deals", jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, 
                      MAX(coalesce(res.likes_count, 0))*2
                      + MAX(coalesce(res.dislikes_count, 0))*(-1)
                      AS popular_score,
                      COUNT (c.id) as comments_count, res.likes_count
                    FROM deals AS d LEFT JOIN (
                        comments AS c
                        JOIN users AS u ON u.id = c.user_id
                      ) ON d.id = c.deal_id
                    LEFT JOIN
                      (SELECT r.deal_id,
                        COUNT(r.id) FILTER (WHERE r.is_liked IS TRUE) AS likes_count,
                        COUNT(r.id) FILTER (WHERE r.is_liked IS FALSE) AS dislikes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE d.status = 'approved' 
                      AND (d.expired_at IS NULL OR d.expired_at >= $1)
                      AND (d.expired IS NOT true)
                      AND (d.category = $2 OR $3 = true)
                      AND u.blocked_by IS NULL
                      AND c.deleted_mark IS NULL
                    GROUP by d.id, res.likes_count
                    ORDER BY popular_score DESC, comments_count DESC
                    LIMIT $4`;
    const {query: {limit, category}} = req;
    const values = [now(), category, category === 'all', limit]
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows;
      return res.status(200).send(deals.map((item) => (
        {
          ...item,
          interaction: {
            views: item.views || 0,
            comments: item.comments_count,
            likes: item.likes_count || 0
          }
        }
      )));
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get("/api/dealbee/deals/for_you", [authJwt.verifyToken], async (req, res) => {
  try {
    const { query: { limit, offset }, userId } = req;
    const strSql = `SELECT following_categories FROM users WHERE id = $1`
    const values = [userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const categories = resQuery.rows[0].following_categories;
      if (!categories) return res.status(200).send([]);

      const strSql = `SELECT *,
                        CAST(info ->> 'discount' AS int) AS discount_percentage,
                        CAST(info ->> 'originalPrice' AS int) - CAST(info ->> 'price' AS int) AS discount_price
                      FROM deals
                      WHERE status = 'approved'
                        AND category = ANY ($1::varchar[])
                        AND (expired_at IS NULL OR expired_at >= $2)
                      ORDER BY discount_price DESC NULLS LAST, discount_percentage DESC
                      OFFSET $3
                      LIMIT $4`;
      const values = [categories, now(), offset, limit];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        return res.status(200).send(resQuery.rows.map((item) => item));
      });
    }); 
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.get(`/api/dealbee/deal/id`, [authJwt.verifyToken, authJwt.hasEditorPermission], async (req, res) => {
  try {
    const strSql = `SELECT d.*, u.username
                    FROM deals d
                    LEFT JOIN users u ON u.id = d.user_id
                    WHERE d.id = $1`;
    const values = [req.query.id];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deal = resQuery.rows[0];
      if (!deal) {
        return res.status(200).send({message: "[error][deal][not found]"});
      }
      if (req.editorsCategories.indexOf(deal.category) > 0 || (
        req.editorsCategories[0] === "all" && req.editorsCategories.length === 1
      ))
        return res.status(200).send({
          message: "success",
          ...deal,
        });
      else return res.status(200).end()
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

route.get(`/api/dealbee/deal`, jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, u.username
                    FROM deals d
                    LEFT JOIN users u ON u.id = d.user_id
                    WHERE d.id = $1
                    GROUP BY d.id, u.username`;
    const values = [req.query.id];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deal = resQuery.rows[0];
      if (!deal) {
        return res.status(200).send({message: "[error][deal][not found]"});
      }
      if (deal.status !== "approved") {
        return res.status(200).send({message: "[error][deal][not approved]"})
      }
      if (getSlug(deal.info.title) === req.query.slug) {
        try {
          const strSql = `SELECT COUNT(c.id) AS count
                          FROM comments AS c
                          JOIN users as u ON c.user_id = u.id 
                          WHERE c.deal_id = $1
                            AND c.deleted_mark IS NULL 
                            AND u.blocked_by IS NULL`;
          const values = [req.query.id];
          db.query(strSql, values, (errQuery, resQuery) => {
            if (errQuery) {
              res.status(500).send(errQuery.message);
              return;
            }
            const comments_count = resQuery.rows[0].count;
            authJwt.verifyToken(req, res, () => {
              if (req.userId) { 
                const strSql = `SELECT * FROM reported_deals WHERE deal_id = $1 AND user_id = $2`;
                const values = [req.query.id, req.userId];
                db.query(strSql, values, (errQuery, resQuery) => {
                  if (errQuery) {
                    res.status(500).send(errQuery.message);
                    return;
                  }
                  const data = resQuery.rows[0];
                  return res.status(200).send({
                    message: "success",
                    ...deal,
                    comments_count,
                    currentUserReported: !data ? null : {
                      content: data.content,
                      type: data.type,
                      reported_at: data.reported_at
                    },
                  });
                })
              } else {
                return res.status(200).send({
                  message: "success",
                  ...deal,
                  comments_count,
                  currentUserReported: null,
                });
              }
            })
          })
        } catch (err) {
          res.status(500).send(err.message);
        }
      } else {
        return res.status(200).send({message: "[error][deal][not found]"});
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


route.get(`/api/dealbee/deals/user`, async (req, res) => {
  try {
    const {query: {username, page, limit}} = req; 
    const strSql = `SELECT id FROM users WHERE username = $1`;
    db.query(strSql, [username], (errQuery, resQuery) => {
        if (errQuery)
        return res.status(500).send(errQuery.message);
      const user = resQuery.rows[0];
      if (!user)
        return res.status(404).send({ message: "User not found!" });
      
      const strSql = `SELECT d.*, res.likes_count, COUNT(c.id) AS comments_count FROM deals d
                      LEFT JOIN (comments AS c JOIN users as u on u.id = c.user_id) on c.deal_id = d.id
                      LEFT JOIN
                        (SELECT r.deal_id, count(r.id) AS likes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                      AS res ON res.deal_id = d.id
                      WHERE d.user_id = $1 AND d.status = 'approved'
                            AND c.deleted_mark IS NULL
                            AND u.blocked_by IS NULL
                      GROUP BY d.id, res.likes_count
                      ORDER BY id DESC
                      LIMIT $2
                      OFFSET $3`;
      const values = [user.id, limit, (page-1)*limit];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) 
          return res.status(500).send(errQuery.message);

        const deals = resQuery.rows
        return res.status(200).send(deals.map((item) => ({
          ...item,
          interaction: {
            views: item.views || 0,
            likes: item.likes_count || 0,
            comments: item.comments_count
          }
        })));
      });
    }); 
  } catch (err) {
    res.status(500).send(err.message);
  }
});

route.get(`/api/dealbee/pending_deals`, [authJwt.verifyToken], async (req, res) => {
  try {
    const {query: {userId, page, limit}} = req; 
    if (parseInt(userId) !== req.userId) {
      res.status(500).send({message: "Not authorized!"});
      return;
    }
    const strSql = `SELECT * FROM deals 
                    WHERE user_id = $1 AND status = $2
                    ORDER BY created_at DESC
                    LIMIT $3
                    OFFSET $4`;
    const values = [userId, "waiting", limit, (page-1)*limit];
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

route.get(`/api/dealbee/deals/key`, jsonParser, async (req, res) => {
  try {
    const strSql = `SELECT d.*, (unaccent(lower(d.info ->> 'title')) LIKE '%' || $1 || '%') as is_title, COUNT (c.id) as comments_count, res.likes_count from deals d
                    LEFT JOIN (comments AS c JOIN users as u on u.id = c.user_id) on c.deal_id = d.id
                    LEFT JOIN
                      (SELECT r.deal_id, count(r.id) AS likes_count
                        FROM deal_reactions r 
                        JOIN users AS u1 ON u1.id = r.user_id 
                        WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                        GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE (unaccent(lower(d.info ->> 'title')) LIKE '%' || $1 || '%'
                    OR unaccent(lower(d.info ->> 'detail')) LIKE '%' || $1 || '%')
                    AND d.status = 'approved'
                    AND c.deleted_mark IS NULL
                    AND u.blocked_by IS NULL
                    group by d.id, res.likes_count
                    order by is_title desc
                    limit $2
                    offset $3`;
    const values = [req.query.searchKey, req.query.limit, req.query.offset];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows;
      return res.status(200).send(deals.map((item) => (
        {
          ...item,
          interaction: {
            views: item.views || 0,
            comments: item.comments_count,
            likes: item.likes_count || 0
          }
        }
      )));
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

route.put(`/api/dealbee/deals/deal/views`, jsonParser, async (req, res) => {
  try {
    const strSql = `UPDATE deals
                    SET views = $1
                    WHERE id = $2 RETURNING views`
    const values = [req.body.newViews, req.body.id];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    });
  } catch (err) {
    res.status(500).send(err.rows[0]);
  }
})

route.put(`/api/dealbee/deals/reported_deal/update`, [authJwt.verifyToken], async (req, res) => {
  try {
    const strSql = `UPDATE deals
                    SET is_reported = $1
                    WHERE id = $2 RETURNING id, is_reported`
    const values = [req.body.newIsReported, req.body.id];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      return res.status(200).send(resQuery.rows);
    });
  } catch (err) {
    res.status(500).send(err.rows[0]);
  }
})

route.post("/api/dealbee/reported_deal", [authJwt.verifyToken, verifyDeal.checkIfDealIsApproved], async (req, res) => {
  const {userId, body: {dealId, type, content, category}} = req;
  try {
    try {
      const strSql = "SELECT * FROM reported_deals WHERE deal_id = $1 AND user_id = $2";
      const values = [dealId, userId];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          res.status(500).send(errQuery.message);
          return;
        }
        const report = resQuery.rows[0];
        if (report) {
          res.status(500).send({message: "You reported this deal!"});
          return;
        } 
        const strSql = `INSERT INTO reported_deals (deal_id, user_id, type, content, reported_at)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING type, content, reported_at`;
        const values = [dealId, userId, type, content, now()];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (errQuery) {
            res.status(500).send(errQuery.message);
            return;
          }
          addNotificationForAdminAndEditor(dealId, category, `[reported deal][${dealId}]`);
          return res.status(200).send({message: "success", ...resQuery.rows[0]});
        })
      })
    } catch (err) {
      res.status(500).send(err.message);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
})

route.delete("/api/dealbee/reported_deal", [authJwt.verifyToken, verifyDeal.checkIfDealIsApproved], async (req, res) => {
  const {userId, query: {dealId}} = req;
  try {
    const strSql = "DELETE FROM reported_deals WHERE deal_id = $1 AND user_id = $2";
    const values = [dealId, userId];
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

route.get(`/api/dealbee/following_deals`, [authJwt.verifyToken], async (req, res) => {
  try {
    const {query: {username, page, limit}} = req;
    const strSql = `SELECT d.*, res.likes_count, count(c.id) as comments_count
                    FROM users u
                    JOIN deals d ON d.id = ANY (u.following_deals_id::int[])
                    LEFT JOIN (comments AS c JOIN users as u1 on u1.id = c.user_id) on c.deal_id = d.id
                    LEFT JOIN
                      (SELECT r.deal_id, count(r.id) AS likes_count
                      FROM deal_reactions r 
                      JOIN users AS u1 ON u1.id = r.user_id 
                      WHERE r.is_liked IS TRUE AND u1.blocked_by IS NULL
                      GROUP BY r.deal_id)
                    AS res ON res.deal_id = d.id
                    WHERE u.username= $1
                    GROUP BY d.id, res.likes_count
                    LIMIT $2
                    OFFSET $3`;
    const values = [username, limit, (page-1)*limit];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        res.status(500).send(errQuery.message);
        return;
      }
      const deals = resQuery.rows.map((item) => ({
        ...item,
        interaction: {
          views: item.views || 0,
          likes: item.likes_count || 0,
          comments: item.comments_count
        }
      }))
      return res.status(200).send({message: "success", deals});
      
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = route; 
