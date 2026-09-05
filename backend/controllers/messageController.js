const db = require("../config/db");


const sendMessage = async (req, res) => {

    try {

        const { message } = req.body;

        const userId = req.user.id;


        // Validate message
        if (!message || message.trim() === "") {
            return res.status(400).json({
                message: "Message cannot be empty"
            });
        }


        const [result] = await db.promise().execute(
            "INSERT INTO messages (user_id, message) VALUES (?, ?)",
            [userId, message.trim()]
        );

        const [savedMessage] = await db.promise().execute(
    "SELECT id, user_id, message, createdAt FROM messages WHERE id = ?",
    [result.insertId]
);

const io = req.app.get("io");
io.emit("chat message", savedMessage[0]);

        return res.status(201).json({
            message: "Message sent successfully",
            messageId: result.insertId
        });

    } catch (error) {

        console.error("Send message error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getMessages = async (req, res) => {

    try {

        const [messages] = await db.promise().execute(
            "SELECT id, user_id, message, createdAt FROM messages ORDER BY createdAt ASC"
        );


        return res.status(200).json({
            messages: messages
        });

    } catch (error) {

        console.error("Get messages error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    sendMessage,
    getMessages
};