const chatHandler = (io, socket) => {
    const userId = socket.user.id;

    console.log("Socket.IO client connected:", socket.id);
    console.log("User ID:", userId);

    // Join a private chat room
    socket.on("join_room", (roomName) => {
        if (!roomName || roomName.trim() === "") {
            return;
        }

        const room = roomName.trim();

        socket.join(room);

        console.log(
            `User ${userId} joined private room: ${room}`
        );
    });

    // Leave a private chat room
    socket.on("leave_room", (roomName) => {
        if (!roomName || roomName.trim() === "") {
            return;
        }

        const room = roomName.trim();

        socket.leave(room);

        console.log(
            `User ${userId} left private room: ${room}`
        );
    });

    // Join a group room
    socket.on("join_group", (groupName) => {
        if (!groupName || groupName.trim() === "") {
            return;
        }

        const roomName = groupName.trim();

        socket.join(roomName);

        console.log(
            `User ${userId} joined group: ${roomName}`
        );

        socket.emit("group_joined", {
            groupName: roomName,
            message: `You joined ${roomName}`
        });
    });

    // Leave a group room
    socket.on("leave_group", (groupName) => {
        if (!groupName || groupName.trim() === "") {
            return;
        }

        const roomName = groupName.trim();

        socket.leave(roomName);

        console.log(
            `User ${userId} left group: ${roomName}`
        );
    });

    // Send message to a group
    socket.on("group_message", (data) => {
        const { groupName, message } = data;

        if (!groupName || !message || message.trim() === "") {
            return;
        }

        const roomName = groupName.trim();
        const messageText = message.trim();

        // Check whether the user has joined this room
        if (!socket.rooms.has(roomName)) {
            socket.emit("group_error", {
                message: "You must join the group before sending messages."
            });

            return;
        }

        const messageData = {
            userId: userId,
            groupName: roomName,
            message: messageText,
            createdAt: new Date()
        };

        // Send only to members of this group
        io.to(roomName).emit(
            "group_message",
            messageData
        );
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log(
            "Socket.IO client disconnected:",
            socket.id
        );

        console.log("User ID:", userId);
    });
};

module.exports = chatHandler;