const signupSection = document.getElementById("signup-section");
const loginSection = document.getElementById("login-section");

const showLogin = document.getElementById("show-login");
const showSignup = document.getElementById("show-signup");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");


// ========================================
// Switch to Login
// ========================================

showLogin.addEventListener("click", function (event) {
    event.preventDefault();

    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});


// ========================================
// Switch to Signup
// ========================================

showSignup.addEventListener("click", function (event) {
    event.preventDefault();

    loginSection.classList.add("hidden");
    signupSection.classList.remove("hidden");
});


// ========================================
// Signup
// ========================================

signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const password = document.getElementById("signup-password").value;


    // Frontend validation

    if (!name || !email || !phone || !password) {
        alert("All fields are required.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email.");
        return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        return;
    }

    if (password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
    }


    try {

        const response = await fetch(
            "http://3.108.236.28/api/auth/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {
            alert(data.message);
            return;
        }


        alert("Signup successful!");


        signupForm.reset();


        // Show login page
        signupSection.classList.add("hidden");
        loginSection.classList.remove("hidden");

    } catch (error) {

        console.error("Signup error:", error);

        alert("Unable to connect to the server.");
    }
});


// ========================================
// Login
// ========================================

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const user = document.getElementById("login-user").value.trim();
    const password = document.getElementById("login-password").value;


    if (!user || !password) {
        alert("Email/phone and password are required.");
        return;
    }


    try {

        const response = await fetch(
            "http://3.108.236.28/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user,
                    password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {
            alert(data.message);
            return;
        }


        // Save JWT token
localStorage.setItem("token", data.token);

window.location.href = "chat.html";

        loginForm.reset();


        console.log("JWT Token:", data.token);

    } catch (error) {

        console.error("Login error:", error);

        alert("Unable to connect to the server.");
    }
});