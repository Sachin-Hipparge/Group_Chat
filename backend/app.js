const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");


const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = 5000;

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("Socket.IO client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Socket.IO client disconnected:", socket.id);
    });
});


// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});