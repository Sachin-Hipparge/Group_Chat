const crypto = require("crypto");
const path = require("path");

const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Media file is required"
            });
        }

        const extension = path.extname(req.file.originalname);

        const fileName = `media/${Date.now()}-${crypto.randomUUID()}${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        });

await s3.send(command);

const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName
});

const mediaUrl = await getSignedUrl(
    s3,
    getObjectCommand,
    {
        expiresIn: 3600
    }
);
const roomName = req.body.roomName;

if (!roomName || roomName.trim() === "") {
    return res.status(400).json({
        message: "Chat room is required"
    });
}

const io = req.app.get("io");

const mediaMessage = {
    userId: req.user.id,
    senderEmail: req.user.email,
    roomName: roomName.trim(),
    mediaUrl: mediaUrl,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    createdAt: new Date()
};

io.to(roomName.trim()).emit(
    "media_message",
    mediaMessage
);

return res.status(201).json({
    message: "Media uploaded successfully",
    mediaUrl: mediaUrl,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype
});

    } catch (error) {
        console.error("Media upload error:", error);

        return res.status(500).json({
            message: "Unable to upload media"
        });
    }
};

module.exports = {
    uploadMedia
};