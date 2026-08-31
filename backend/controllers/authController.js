const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Sign-up controller
const signup = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check whether all fields are provided
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check whether email already exists
        const [existingEmail] = await db.promise().execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Check whether phone already exists
        const [existingPhone] = await db.promise().execute(
            "SELECT id FROM users WHERE phone = ?",
            [phone]
        );

        if (existingPhone.length > 0) {
            return res.status(409).json({
                message: "Phone number already registered"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const [result] = await db.promise().execute(
            "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
            [name, email, phone, hashedPassword]
        );

        return res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { user, password } = req.body;

        // Check required fields
        if (!user || !password) {
            return res.status(400).json({
                message: "Email/phone and password are required"
            });
        }

        // Find user using email OR phone
        const [users] = await db.promise().execute(
            "SELECT * FROM users WHERE email = ? OR phone = ?",
            [user, user]
        );

        // User not found
        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email/phone or password"
            });
        }

        const existingUser = users[0];

        // Compare entered password with stored bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email/phone or password"
            });
        }

        const token = jwt.sign(
    {
        id: existingUser.id,
        email: existingUser.email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

return res.status(200).json({
    message: "Login successful",
    token: token
});

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    signup,
    login
};