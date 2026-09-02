const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messages = document.getElementById("messages");


function sendMessage() {
    const messageText = messageInput.value.trim();

    if (messageText === "") {
        return;
    }

    const message = document.createElement("div");
    message.classList.add("message", "sent");

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = messageText;

    const currentTime = new Date();

    const time = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");
    timestamp.textContent = time;

    messageContent.appendChild(messageParagraph);
    messageContent.appendChild(timestamp);

    message.appendChild(messageContent);

    messages.appendChild(message);

    messageInput.value = "";

    messages.scrollTop = messages.scrollHeight;

    messageInput.focus();
}


// Send when button is clicked
sendButton.addEventListener("click", sendMessage);


// Send when Enter is pressed
messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});