const signupSection = document.getElementById("signup-section");
const loginSection = document.getElementById("login-section");

const showLogin = document.getElementById("show-login");
const showSignup = document.getElementById("show-signup");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");


// ===============================
// Switch to Login
// ===============================

showLogin.addEventListener("click", function (event) {
    event.preventDefault();

    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});


// ===============================
// Switch to Signup
// ===============================

showSignup.addEventListener("click", function (event) {
    event.preventDefault();

    loginSection.classList.add("hidden");
    signupSection.classList.remove("hidden");
});


// ===============================
// Signup
// ===============================

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const password = document.getElementById("signup-password").value;

    // Name validation
    if (name === "") {
        alert("Please enter your name.");
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email.");
        return;
    }

    // Phone validation
    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        return;
    }

    // Password validation
    if (password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
    }


    // Create user object
    const user = {
        name: name,
        email: email,
        phone: phone,
        password: password
    };


    // Store user in browser
    localStorage.setItem("user", JSON.stringify(user));

    alert("Signup successful!");


    signupForm.reset();

    // Go to login page
    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});


// ===============================
// Login
// ===============================

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const userInput = document.getElementById("login-user").value.trim();
    const password = document.getElementById("login-password").value;


    // Get stored user
    const storedUser = localStorage.getItem("user");


    if (!storedUser) {
        alert("No account found. Please sign up first.");
        return;
    }


    const user = JSON.parse(storedUser);


    // Check email/phone and password
    const validUser =
        (user.email === userInput || user.phone === userInput) &&
        user.password === password;


    if (validUser) {
        alert("Login successful!");
        loginForm.reset();
    } else {
        alert("Invalid email/phone or password.");
    }
});