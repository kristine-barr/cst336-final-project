import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.mjs";

const router = express.Router();

// Showing login page
router.get("/login", (req, res) => {
    res.render("./auth/login");
});

// Checks the user's login information
router.post("/login", async(req, res) => {

    // Gets the email and password from the login form
    const { email, password } = req.body;

    try {

        // Looks for a user with the entered email
        const [users] = await pool.query(
            "SELECT * FROM Users WHERE email = ?",
            [email]
        );

        // If no account matches the email, stop login
        if (users.length === 0) {
            return res.status(401).send("Invalid email or password");
        }

        // Grab the user found in the database
        const user = users[0];

        // Compare entered password with the hashed password from MySQL
        const passwordMatches = await bcrypt.compare(
            password,
            user.password,
        );

        // Stop if the password does not match
        if (!passwordMatches) {
            return res.status(401).send("Invalid password or password");
        }

        // Save the logged-in user's ID in the session
        req.session.userId = user.userId;

        // Send user to the dashboard after successful login
        res.redirect("/dashboard");

    } catch (error) {

        // Show error in the terminal if something goes wrong
        console.error("Login error:", error);

        res.status(500).send("Unable to Login");
    }
});

// Shows the register page
router.get("/register", (req, res) => {
    res.render("./auth/register");
});

// Creates a new user account
router.post("/register", async (req, res) => {

    // Gets the form values
    const { firstName, lastName, email, password } = req.body;

    try {

        // Check if the email already exists
        const [existingUsers] = await pool.query(
            "SELECT * FROM Users WHERE email = ?",
            [email]
        );

        // Stop if the email is already registered
        if (existingUsers.length > 0) {
            return res.status(400).send("An account with this email already exists.");
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user in the database
        await pool.query(
            `INSERT INTO Users (firstName, lastName, email, password)
             VALUES (?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword]
        );

        // Send the new user to the login page
        res.redirect("/login");

    } catch (error) {

        // Shows database or server errors in the terminal
        console.error("Registration error:", error);

        res.status(500).send("Unable to create account.");
    }
});

export default router;