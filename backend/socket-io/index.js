const { Server } = require("socket.io");

const socketAuth = require("./middleware");
const chatHandler = require("./handlers/chat");

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.use(socketAuth);

    io.on("connection", (socket) => {
        chatHandler(io, socket);
    });

    return io;
};

module.exports = setupSocket;