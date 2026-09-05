const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    checkUserByEmail
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", checkUserByEmail);

module.exports = router;