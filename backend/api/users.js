const { authJwt } = require("../middleware");
const controller = require("../controllers/users");

const express = require('express');
const route = express.Router();

route.get(
  `/api/dealbee/current_user`, 
  // [authJwt.verifyToken], 
  controller.getCurrentUser
);

route.get(
  "/api/dealbee/user",
  controller.getUser
)

route.get(
  "/api/dealbee/active_users",
  controller.getActiveUsers
)

route.put("/api/dealbee/user/reputation_score/update", [authJwt.verifyToken], controller.updateReputationScore)

route.put("/api/dealbee/user/following_deal/update", [authJwt.verifyToken], controller.updatefollowingDealsId)

route.get(
  "/api/dealbee/user/notifications",
  [authJwt.verifyToken],
  controller.getMyNotifications
)

route.put(
  "/api/dealbee/user/notification/mark_as_read",
  [authJwt.verifyToken],
  controller.markNotiAsRead
)

route.post(
  '/api/dealbee/user/follow',
  [authJwt.verifyToken],
  controller.followUser,
)

route.post(
  '/api/dealbee/user/unfollow',
  [authJwt.verifyToken],
  controller.unFollowUser,
)

route.get(
  '/api/dealbee/user/follower',
  [authJwt.verifyToken],
  controller.getFollowerByUsername,
)

route.get(
  '/api/dealbee/user/following',
  [authJwt.verifyToken],
  controller.getFollowingByUsername,
)

route.get(
  '/api/dealbee/user/follower/info',
  [authJwt.verifyToken],
  controller.getFollowerInfoByUsername,
)

route.get(
  '/api/dealbee/user/following/info',
  [authJwt.verifyToken],
  controller.getFollowingInfoByUsername,
)

route.post(
  '/api/dealbee/user/feedback',
  controller.sendFeedback
)

module.exports = route;