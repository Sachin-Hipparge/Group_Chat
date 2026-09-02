const express = require("express");

const router = express.Router();

const {
    sendMessage,
    getMessages
} = require("../controllers/messageController");

const authenticateToken = require("../middleware/authMiddleware");


router.post(
    "/",
    authenticateToken,
    sendMessage
);


router.get(
    "/",
    authenticateToken,
    getMessages
);


module.exports = router;