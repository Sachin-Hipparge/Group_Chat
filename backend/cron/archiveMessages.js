const cron = require("node-cron");
const db = require("../config/db");

const archiveOldMessages = async () => {
    try {
        console.log("Starting message archiving...");

        const [oldMessages] = await db.promise().execute(
            `SELECT id, user_id, message, createdAt
             FROM messages
             WHERE createdAt < NOW() - INTERVAL 1 DAY`
        );

        if (oldMessages.length === 0) {
            console.log("No old messages to archive.");
            return;
        }

        for (const msg of oldMessages) {
            await db.promise().execute(
                `INSERT INTO ArchivedChat
                 (user_id, message, createdAt)
                 VALUES (?, ?, ?)`,
                [msg.user_id, msg.message, msg.createdAt]
            );

            await db.promise().execute(
                "DELETE FROM messages WHERE id = ?",
                [msg.id]
            );
        }

        console.log(
            `${oldMessages.length} old message(s) archived successfully.`
        );

    } catch (error) {
        console.error("Message archiving error:", error);
    }
};

cron.schedule("0 0 * * *", archiveOldMessages);

console.log("Message archiving cron job scheduled.");

module.exports = archiveOldMessages;
