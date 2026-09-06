const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const setupSocket = require("./socket-io");
require("./cron/archiveMessages");

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/media", mediaRoutes);

const PORT = 5000;

// Create HTTP server
const server = http.createServer(app);

const io = setupSocket(server);

app.set("io", io);


// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
