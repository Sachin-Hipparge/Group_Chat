const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadMedia } = require("../controllers/mediaController");

const router = express.Router();

router.post(
    "/upload",
    authenticateToken,
    upload.single("media"),
    uploadMedia
);

module.exports = router;