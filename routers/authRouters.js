const { Router } = require("express");
const auth = require("../controllers/authController");
const User = require("../model/User");
const {
  isVip,
  isAuthenticated,
  authenticateToken,
} = require("../milldware/authMilldware");

const router = Router();

router.get("/signup", auth.signup_get);
router.post("/signup", auth.signup_post);
router.get("/login", auth.login_get);
router.post("/login", auth.login_post);
router.get("/articles", authenticateToken, auth.article_get);
router.post("/devenir-admin", authenticateToken, auth.devenir_admin);
router.get("/userL", authenticateToken, auth.userId);
router.post("/payment", authenticateToken, auth.payments);

// router.post("/logout", auth.logout);

module.exports = router;
