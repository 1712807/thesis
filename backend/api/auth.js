const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/auth");

const express = require('express');
const route = express.Router();

route.post(
  "/api/dealbee/user/signup",
  [verifySignUp.checkDuplicateUsername, verifySignUp.checkDuplicateEmail],
  controller.signup
);

route.post(
  "/api/dealbee/admin/user",
  [
    verifySignUp.checkDuplicateUsername,
    verifySignUp.checkDuplicateEmail,
    authJwt.verifyToken, 
    authJwt.isAdmin
  ],
  controller.createUser
)

route.post("/api/dealbee/user/signin", controller.signin);

route.put(
  "/api/dealbee/user/password/change",
  [authJwt.verifyToken],
  controller.changePassword
)

route.put(
  "/api/dealbee/user/password/reset",
  controller.resetPassword
)

route.put(
  "/api/dealbee/user/",
  [authJwt.verifyToken, verifySignUp.checkDuplicateEmail],
  controller.editInfo
)

module.exports = route;