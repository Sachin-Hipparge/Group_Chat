const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");


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

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error("Authentication token required"));
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.user = decoded;

        next();
    } catch (error) {
        return next(new Error("Invalid or expired token"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log("Socket.IO client connected:", socket.id);
    console.log("User ID:", userId);

    socket.on("disconnect", () => {
        console.log("Socket.IO client disconnected:", socket.id);
        console.log("User ID:", userId);
    });
});


// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});