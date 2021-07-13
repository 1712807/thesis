const db = require("../db");
const moment = require("moment");
const slugify = require("slugify");
const { EMAIL_TYPES } = require("./constant");
const now = () => moment().format('YYYY-MM-DD HH:mm:ss');

exports.getSlug = (title) => {
    return slugify(title, {
      lower: true,
      locale: 'vi',
      strict: true,
    });
}

exports.getLevelName = (point) => {
  if (point < 599) return "Tân binh";
  if (point < 2399) return "Ngôi sao mới nổi";
  if (point < 4999) return "Tín đồ săn deal";
  if (point < 9999) return "Thợ săn deal";
  return "Thánh săn deal";
}

exports.addNotification = (notification) => {
    const {targetUserId, dealId, action} = notification;
    try {
      const strSql = "SELECT id, action FROM notifications WHERE target_user_id = $1 AND (deal_id = $2 OR $2 IS NULL) AND action LIKE $3 || '%'";
      const index = action.lastIndexOf('[');
      const notiType = action.substring(0, index);
      const values = [targetUserId, dealId, notiType];
      db.query(strSql, values, (errQuery, resQuery) => {
        if (errQuery) {
          console.log(errQuery.message);
        }
        try {
          const strSql = resQuery.rows[0] 
            ? "UPDATE notifications SET action = $1, created_at = $2, is_displayed = false, is_read = false WHERE id = $3"
            : "INSERT INTO notifications (target_user_id, deal_id, action, created_at) VALUES ($1, $2, $3, $4)";
          const values = resQuery.rows[0]
            ? [action, now(), resQuery.rows[0].id]
            : [targetUserId, dealId, action, now()]
          db.query(strSql, values, (errQuery, resQuery) => {
            if (errQuery) {
              console.log(errQuery.message);
            }
            // console.log("add noti success");
          })
        } catch (err) {
          console.log(err.message);
        }
      })
    } catch (err) {
      console.log(err.message);
    }
}

exports.addNotificationForUserFollowingDeal = (dealId, type) => {
  try {
    const strSql = `SELECT id FROM users WHERE $1 = ANY (following_deals_id::int[])`;
    const values = [dealId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
      }
      const userIds = resQuery.rows.map(i => i.id);
      for (let i = 0; i < userIds.length; i++) {
          const notification = {
            targetUserId: userIds[i],
            action: type,
            dealId,
          }
          exports.addNotification(notification);
      }
      
    })
  } catch (err) {
    console.log(err.message);
  }
}

exports.addNotificationForUserFollowingCategory = (category, dealInfo) => {
  try {
    const strSql = `SELECT id, info, email, email_notifications FROM users WHERE $1 = ANY (following_categories::varchar[])`;
    const values = [category === "others" ? "all" : category];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
      }
      const users = resQuery.rows.map((user) => ({
        id: user.id,
        email: user.email,
        emailNoti: user.email_notifications && user.email_notifications.followingCategories,
        info: user.info,
      }));
      let emailList = [];
      for (let i = 0; i < users.length; i++) {
          const {id, email, emailNoti, info: {displayName}} = users[i];
          const notification = {
            targetUserId: id,
            action: `[new deal on category][${category}]`,
          }
          exports.addNotification(notification);
          if (emailNoti) emailList.push({email, displayName});
      }
      try {
        const strSql = `SELECT label FROM categories WHERE key = $1`;
        const values = [category];
        db.query(strSql, values, (errQuery, resQuery) => {
          if (resQuery.rows[0] && emailList) {
            const params = {
              category: resQuery.rows[0].label, 
              dealInfo,
            }
            const { emailService } = require("../middleware");
            emailService.sendEmail(emailList, EMAIL_TYPES.newDealOnCategory, params)
          }
        })
      } catch (e) {
        console.log(e.message);
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

exports.addNotificationForAllUserFollowingUser = (userId, dealId) => {
  try {
    const strSql = `SELECT f.followed_by_user_id, u.info, u.username from following_users f
                    join users u on u.id = $1
                    WHERE f.followed_user_id = $1`;
    const values = [userId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
      }
      const userIds = resQuery.rows.map(i => i.followed_by_user_id);
      if (userIds.length > 0) {
        const displayNameUser = resQuery.rows[0].info.displayName || resQuery.rows[0].username
        for (let i = 0; i < userIds.length; i++) {
          const notification = {
            targetUserId: userIds[i],
            action: `[following user][${displayNameUser}]`,
            dealId,
          }
          exports.addNotification(notification);
        }
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

exports.addNotificationForReportedCommentOwner = (commentId) => {
  try {
    const strSql = `SELECT user_id, deal_id, content FROM comments WHERE id = $1`;
    const values = [commentId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
      }
      const {user_id: commentOwnerId, deal_id: dealId, content : { text }} = resQuery.rows[0]
      const notification = {
        targetUserId: commentOwnerId,
        action: `[reported comment][${text}]`,
        dealId,
      }
      exports.addNotification(notification);
      exports.addNotificationForAdminAboutReportedComment(commentId, dealId, text)
    })
  } catch (err) {
    console.log(err.message);
  }
}

exports.addNotificationForAdminAboutReportedComment = (commentId, dealId, text) => {
  try {
    const strSql = `SELECT id FROM users WHERE role = 'admin' OR role = 'moderator'`;
    db.query(strSql, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
      }
      const adminIds = resQuery.rows.map(i => i.id)
      for (let i = 0; i< adminIds.length; i++) {
        const notification = {
          targetUserId: adminIds[i],
          action: `[admin][reported comment][${text}][${commentId}]`,
          dealId,
        }
        exports.addNotification(notification);
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

exports.addNotificationForUserAboutChangeLevel = (oldPoint, newPoint, userId) => {
  const status = oldPoint < newPoint;
  const notification = {
    targetUserId: userId,
    action: `[change level][${status}][${exports.getLevelName(oldPoint)}][${exports.getLevelName(newPoint)}]`,
  }
  exports.addNotification(notification);
}

exports.addNotificationForAdminAndEditor = (dealId, category, content, editorOnly) => {
  try {
    const strSql = `SELECT id
                    FROM users 
                    WHERE (role = 'admin' AND $2 IS TRUE) OR role = 'editor'
                    AND $1 = ANY (editors_categories::varchar[])`;
    const values = [category, !editorOnly];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
        return;
      }
      const users = resQuery.rows;
      // const emailReceivers = [];
      users.forEach((user) => {
        const {id} = user;
        // const {id, email, info: {displayName}} = user;
        exports.addNotification({
          targetUserId: id,
          action: content,
          dealId: dealId,
        })
        // emailReceivers.push({email, displayName});
      })
      // sendEmail(emailReceivers, EMAIL_TYPES.newReportedDeal, {dealInfo: {id: dealId, info: {title}}})
    })
  } catch (err) {
    console.log(err);
  }
}

exports.addNotificationForOwnerAboutFeaturedComment = (userId, status, dealId, content) => {
  const notification = {
    targetUserId: userId,
    action: `[featured comment][${content}][${status}]`,
    dealId,
  }
  exports.addNotification(notification);
}

exports.addNotificationForCommentOwnerAboutReplying = (childUserId, parentId) => {
  try {
    const strSql = `SELECT c.*, u.info FROM comments c
                    JOIN users u ON u.id = c.user_id
                    WHERE c.id = $1 OR (c.parent_id = $1 and c.user_id = $2)`;
    const values = [parentId, childUserId];
    db.query(strSql, values, (errQuery, resQuery) => {
      if (errQuery) {
        console.log(errQuery.message);
      }
      const comments = resQuery.rows;
      const parentComment = comments.filter((i) => i.id === parentId)[0];
      const childComment = comments.filter((i) => i.parent_id === parentId)[0];
      if (parentComment.user_id !== childComment.user_id) {
        const parentCommentContent = parentComment.content.text;
        const childUserName = childComment.info.displayName;
        const notification = {
          targetUserId: parentComment.user_id,
          action: `[reply comment][${childUserName}][${parentCommentContent}]`,
          dealId: parentComment.deal_id,
        }
        exports.addNotification(notification);
      }
      
    })
  } catch (err) {
    console.log(err.message);
  }
}

exports.addNotificationForCommentOwnerAboutLikes = (userId, content, dealId) => {
  const notification = {
    targetUserId: userId,
    action: `[like comment][${content}]`,
    dealId,
  }
  exports.addNotification(notification);
}
