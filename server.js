import express from "express";
import path from "path";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import session from 'express-session'

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(session({
    secret: 'WsfhWxg12g',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve the landing page
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// PostgreSQL connection
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "toDo",
    password: "1234",
    port: 5432,
});

db.connect()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Connection error", err.stack));

// Signup endpoint
app.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    console.log("Received data:", { name, email, password, confirmPassword }); // Log the received data

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // Check if email already exists
        const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the database
        const result = await db.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );
        console.log("User created:", result.rows[0]); // Log the created user
        req.session.userEmail = email;
        // Redirect to home page
        res.redirect("/home.html");
    } catch (err) {
        console.error("Error during signup:", err); // Log any errors
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// server.js

// Add this endpoint to fetch user data
app.get("/user", async (req, res) => {
    // Assuming you store the user's email in a session after login
    const userEmail = req.session.userEmail; // You need to set this during login

    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const result = await db.query("SELECT name FROM users WHERE email = $1", [userEmail]);
        if (result.rows.length > 0) {
            res.json({ name: result.rows[0].name });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});