const { Router } = require("express");
const auth = require("../controllers/authController");
const User = require("../model/User");
const authenticateToken = require("../milldware/authMilldware");
const { isVip, isAuthenticated } = require("../milldware/authMilldware");

const router = Router();

// router.post("/", auth.main_user);
router.get("/signup", auth.signup_get);
router.post("/signup", auth.signup_post);
router.get("/login", auth.login_get);
router.post("/login", auth.login_post);
router.get("/articles", authenticateToken, auth.article_get);
router.post("/devenir-admin", authenticateToken, auth.devenir_admin);
router.put("/reset", auth.reset_pwd);
router.get("/userL", authenticateToken, auth.userId);
router.post("/payment", auth.payments);
router.get("/check-auth", auth.check_isAuth);
// router.post("/logout", auth.logout);

module.exports = router;
