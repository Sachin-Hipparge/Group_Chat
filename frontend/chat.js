const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messages = document.getElementById("messages");
const recipientInput = document.getElementById("recipient-input");


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
            `http://localhost:5000/api/auth/user?email=${encodeURIComponent(recipientEmail)}`,
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


// Socket.IO connection
const token = localStorage.getItem("token");

const socketIO = io("http://localhost:5000", {
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

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/messages",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    message: messageText
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }






// Message will be displayed through WebSocket
messageInput.value = "";
messageInput.focus();

    } catch (error) {

        console.error("Send message error:", error);

        alert("Unable to send message.");
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
            "http://localhost:5000/api/messages",
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


messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

recipientInput.addEventListener("change", joinPrivateRoom);

// Load previous messages when chat page opens
loadMessages();