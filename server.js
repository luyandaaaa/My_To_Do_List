import express from "express";
import path from "path";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

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
app.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

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

        res.status(201).json({ message: "User created successfully", user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function fetchTasks(category) {
    const response = await fetch(`/tasks/${userId}/${category}`);
    const tasks = await response.json();
    renderTasks(tasks);
}

fetchTasks(); // Fetch tasks for the "Work" category

async function createTask(category, taskData) {
    const response = await fetch(`/tasks/${category}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
    });
    const result = await response.json();
    if (response.ok) {
        fetchTasks(category); // Refresh the task list
    } else {
        console.error(result.error);
    }
}

app.get("/tasks/:userId/:category", async (req, res) => {
    const { userId, category } = req.params;
    const validCategories = ["work", "personal", "shopping", "health"];
    
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const tableName = `${category}_tasks`;
        const result = await db.query(`SELECT * FROM ${tableName} WHERE user_id = $1`, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/tasks/:category", async (req, res) => {
    const { category } = req.params;
    const { userId, name } = req.body;
    const validCategories = ["work", "personal", "shopping", "health"];

    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    if (!userId || !name) {
        return res.status(400).json({ error: "User ID and task name are required" });
    }

    try {
        const tableName = `${category}_tasks`;
        const result = await db.query(
            `INSERT INTO ${tableName} (user_id, name) VALUES ($1, $2) RETURNING *`,
            [userId, name]
        );
        res.status(201).json({ message: "Task created successfully", task: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.delete("/tasks/:category/:taskId", async (req, res) => {
    const { category, taskId } = req.params;
    const validCategories = ["work", "personal", "shopping", "health"];

    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const tableName = `${category}_tasks`;
        await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [taskId]);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/tasks/:category/:taskId", async (req, res) => {
    const { category, taskId } = req.params;
    const { name, completed } = req.body;
    const validCategories = ["work", "personal", "shopping", "health"];

    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const tableName = `${category}_tasks`;
        const result = await db.query(
            `UPDATE ${tableName} SET name = $1, completed = $2 WHERE id = $3 RETURNING *`,
            [name, completed, taskId]
        );
        res.status(200).json({ message: "Task updated successfully", task: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});