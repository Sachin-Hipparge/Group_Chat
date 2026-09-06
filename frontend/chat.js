const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messages = document.getElementById("messages");
const recipientInput = document.getElementById("recipient-input");

const groupInput = document.getElementById("group-input");
const joinGroupButton = document.getElementById("join-group-button");
const leaveGroupButton = document.getElementById("leave-group-button");
const currentGroupText = document.getElementById("current-group");

const mediaInput = document.getElementById("media-input");
const mediaSendButton = document.getElementById("media-send-button");

let currentGroup = null;

function getCurrentUserId() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const payload = token.split(".")[1];

        const decodedPayload = JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return Number(decodedPayload.id);

    } catch (error) {
        console.error("Unable to decode token:", error);
        return null;
    }
}


function getCurrentUserEmail() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const payload = token.split(".")[1];

        const decodedPayload = JSON.parse(
            atob(
                payload
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return decodedPayload.email;

    } catch (error) {
        console.error("Unable to decode user email:", error);
        return null;
    }
}


function getPrivateRoom(currentUserEmail, recipientEmail) {
    return [currentUserEmail, recipientEmail]
        .sort()
        .join("-");
}

let currentRoom = null;

async function joinPrivateRoom() {
    const currentUserEmail = getCurrentUserEmail();
    const recipientEmail = recipientInput.value.trim();

    if (!currentUserEmail || !recipientEmail) {
        return;
    }

    if (currentUserEmail === recipientEmail) {
        alert("You cannot chat with yourself.");
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://3.108.236.28/api/auth/user?email=${encodeURIComponent(recipientEmail)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert("User not found.");
            return;
        }

        const roomName = getPrivateRoom(
            currentUserEmail,
            recipientEmail
        );

        if (currentRoom === roomName) {
            return;
        }

        if (currentRoom) {
            socketIO.emit("leave_room", currentRoom);
        }

        socketIO.emit("join_room", roomName);

        currentRoom = roomName;

        console.log("Joined private room:", roomName);

    } catch (error) {
        console.error("User verification error:", error);
        alert("Unable to verify user.");
    }
}

function joinGroup() {
    const groupName = groupInput.value.trim();

    if (!groupName) {
        alert("Please enter a group name.");
        return;
    }

    socketIO.emit("join_group", groupName);
}

function leaveGroup() {
    if (!currentGroup) {
        alert("You are not currently in a group.");
        return;
    }

    socketIO.emit("leave_group", currentGroup);

    currentGroup = null;
    currentGroupText.textContent = "No group joined";

    console.log("Left group");
}


// Socket.IO connection
const token = localStorage.getItem("token");

const socketIO = io("http://3.108.236.28", {
    auth: {
        token: token
    }
});

socketIO.on("connect", () => {
    console.log("Socket.IO connected:", socketIO.id);
});

socketIO.on("disconnect", () => {
    console.log("Socket.IO disconnected");
});

socketIO.on("connect_error", (error) => {
    console.error("Socket.IO authentication error:", error.message);
});

socketIO.on("chat message", (messageData) => {
    displayMessage(messageData);
});

socketIO.on("new_message", (messageData) => {
    console.log("Personal message received:", messageData);

    displayMessage(messageData);
});

socketIO.on("group_joined", (data) => {
    currentGroup = data.groupName;

    currentGroupText.textContent =
        `Current Group: ${currentGroup}`;

    console.log(data.message);
});

socketIO.on("group_message", (messageData) => {
    console.log("Group message received:", messageData);

    displayMessage({
        user_id: messageData.userId,
        message: messageData.message,
        createdAt: messageData.createdAt
    });
});

socketIO.on("media_message", (mediaData) => {
    console.log("Media received:", mediaData);

    displayMediaMessage(mediaData);
});

socketIO.on("group_error", (data) => {
    alert(data.message);
});



function displayMessage(msg) {

    const message = document.createElement("div");

    const currentUserId = getCurrentUserId();



    if (Number(msg.user_id) === currentUserId) {
        message.classList.add("message", "sent");
    } else {
        message.classList.add("message", "received");
    }

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = msg.message;

    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");

    const date = new Date(msg.createdAt);

    timestamp.textContent = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    messageContent.appendChild(messageParagraph);
    messageContent.appendChild(timestamp);

    message.appendChild(messageContent);
    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
    const messageText = messageInput.value.trim();

    if (messageText === "") {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    // GROUP CHAT
    if (currentGroup) {
        socketIO.emit("group_message", {
            groupName: currentGroup,
            message: messageText
        });

        messageInput.value = "";
        messageInput.focus();

        return;
    }

    // PRIVATE CHAT
    const currentUserEmail = getCurrentUserEmail();
    const recipientEmail = recipientInput.value.trim();

    if (!currentUserEmail || !recipientEmail) {
        alert("Please enter a recipient email.");
        return;
    }

    const roomName = getPrivateRoom(
        currentUserEmail,
        recipientEmail
    );

    if (!roomName) {
        return;
    }

    try {
        const response = await fetch(
            "http://3.108.236.28/api/messages",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
    message: messageText,
    roomName: roomName
})
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        messageInput.value = "";
        messageInput.focus();

    } catch (error) {
        console.error("Send message error:", error);
        alert("Unable to send message.");
    }
}

function displayMediaMessage(mediaData) {
    const message = document.createElement("div");
    const currentUserId = getCurrentUserId();

    if (Number(mediaData.userId) === currentUserId) {
        message.classList.add("message", "sent");
    } else {
        message.classList.add("message", "received");
    }

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    if (mediaData.mimeType.startsWith("image/")) {
        const image = document.createElement("img");

        image.src = mediaData.mediaUrl;
        image.alt = mediaData.fileName;

        image.style.maxWidth = "250px";
        image.style.borderRadius = "8px";

        messageContent.appendChild(image);

    } else if (mediaData.mimeType.startsWith("video/")) {
        const video = document.createElement("video");

        video.src = mediaData.mediaUrl;
        video.controls = true;

        video.style.maxWidth = "250px";
        video.style.borderRadius = "8px";

        messageContent.appendChild(video);

    } else {
        const fileLink = document.createElement("a");

        fileLink.href = mediaData.mediaUrl;
        fileLink.target = "_blank";
        fileLink.rel = "noopener noreferrer";

        fileLink.textContent = `📎 ${mediaData.fileName}`;

        messageContent.appendChild(fileLink);
    }

    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");

    const date = new Date(mediaData.createdAt);

    timestamp.textContent = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    messageContent.appendChild(timestamp);

    message.appendChild(messageContent);
    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}


async function sendMedia() {
    const file = mediaInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    const roomName = currentGroup || currentRoom;

    if (!roomName) {
        alert("Please join a group or private chat first.");
        return;
    }

    const formData = new FormData();

    formData.append("media", file);
    formData.append("roomName", roomName);

    try {
        mediaSendButton.disabled = true;

        const response = await fetch(
            "http://3.108.236.28/api/media/upload",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        console.log("Media uploaded:", data);

        mediaInput.value = "";

    } catch (error) {
        console.error("Media upload error:", error);
        alert("Unable to upload media.");
    } finally {
        mediaSendButton.disabled = false;
    }
}

async function loadMessages() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            "http://3.108.236.28/api/messages",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        // Display all messages from database
       data.messages.forEach((msg) => {
    displayMessage(msg);
});


        // Scroll to latest message
        messages.scrollTop = messages.scrollHeight;


    } catch (error) {

        console.error("Load messages error:", error);

        alert("Unable to load messages.");
    }
}

// Send when button is clicked
sendButton.addEventListener("click", sendMessage);

joinGroupButton.addEventListener("click", joinGroup);

leaveGroupButton.addEventListener("click", leaveGroup);

mediaSendButton.addEventListener("click", sendMedia);


messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

recipientInput.addEventListener("change", joinPrivateRoom);

// Load previous messages when chat page opens
loadMessages();