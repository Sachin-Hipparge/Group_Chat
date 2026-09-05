const chatHandler = (io, socket) => {
    const userId = socket.user.id;

    console.log("Socket.IO client connected:", socket.id);
    console.log("User ID:", userId);

    socket.on("disconnect", () => {
        console.log("Socket.IO client disconnected:", socket.id);
        console.log("User ID:", userId);
    });
};

module.exports = chatHandler;