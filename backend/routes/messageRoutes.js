const express = require("express");

const router = express.Router();

const {
    sendMessage
} = require("../controllers/messageController");

const authenticateToken = require("../middleware/authMiddleware");


router.post(
    "/",
    authenticateToken,
    sendMessage
);


module.exports = router;