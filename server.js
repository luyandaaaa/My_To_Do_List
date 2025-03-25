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

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Check if email exists
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare hashed password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Set session
        req.session.userEmail = user.email;

        // Redirect to home page
        res.redirect("/home.html");
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

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
    const userEmail = req.session.userEmail;
    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const result = await db.query("SELECT name, email FROM users WHERE email = $1", [userEmail]);
        if (result.rows.length > 0) {
            res.json({ name: result.rows[0].name, email: result.rows[0].email });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/tasks', async (req, res) => {
    const { name, category, date, startTime, endTime, description } = req.body;

    // Fetch the user's ID from the session
    const userEmail = req.session.userEmail; // Assuming you store the user's email in the session
    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Fetch the user's ID from the database
        const userResult = await db.query("SELECT userid FROM users WHERE email = $1", [userEmail]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].userid; // Use the correct column name here

        // Determine the table name based on the category
        let tableName;
        switch (category) {
            case 'work':
                tableName = 'work_tasks';
                break;
            case 'personal':
                tableName = 'personal_tasks';
                break;
            case 'shopping':
                tableName = 'shopping_tasks';
                break;
            case 'health':
                tableName = 'health_tasks';
                break;
            default:
                return res.status(400).json({ error: "Invalid category" });
        }

        // Insert the task into the appropriate table
        const result = await db.query(
            `INSERT INTO ${tableName} (task_name, date, start_time, end_time, description, user_id, completed) 
             VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
            [name, date, startTime, endTime, description, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete('/tasks/:table/:id', async (req, res) => {
    const { table, id } = req.params;

    try {
        await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        res.json({ success: true, message: "Task deleted" });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put('/tasks/:table/:id', async (req, res) => {
    const { table, id } = req.params;
    const { task_name } = req.body;

    // Validate parameters
    if (!table || !id || !task_name) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        const result = await db.query(
            `UPDATE ${table} SET task_name = $1 WHERE id = $2 RETURNING *`,
            [task_name, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        res.json({ success: true, message: "Task updated", task: result.rows[0] });
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/tasks', async (req, res) => {
    const userEmail = req.session.userEmail;
    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const userResult = await db.query("SELECT userid FROM users WHERE email = $1", [userEmail]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].userid;

        const queries = [
            { table: "work_tasks", category: "work" },
            { table: "personal_tasks", category: "personal" },
            { table: "shopping_tasks", category: "shopping" },
            { table: "health_tasks", category: "health" }
        ];

        let allTasks = [];
        for (const { table, category } of queries) {
            const result = await db.query(
                `SELECT id, task_name as name, description, completed FROM ${table} WHERE user_id = $1`, 
                [userId]
            );
            allTasks.push(...result.rows.map(task => ({
                id: task.id,
                name: task.name,
                description: task.description,
                completed: task.completed,
                category: category,
                table: table
            })));
        }

        res.json(allTasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Add this endpoint to handle checkbox toggles
app.patch('/tasks/:table/:id/toggle', async (req, res) => {
    const { table, id } = req.params;
    const userEmail = req.session.userEmail;

    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Get user ID
        const userResult = await db.query("SELECT userid FROM users WHERE email = $1", [userEmail]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].userid;

        // Check current status of the task
        const taskResult = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found or not owned by user" });
        }

        const task = taskResult.rows[0];
        const isCompleted = task.completed;

        if (!isCompleted) {
            // If marking as complete, move to completed_tasks table
            await db.query(
                `INSERT INTO completed_tasks (user_id, task_name, description, category) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, task.task_name, task.description, table.replace("_tasks", "")]
            );

            // Delete from the original table
            await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

            return res.json({ success: true, message: "Task moved to completed_tasks", task });
        }

        res.json({ success: true, message: "Task remains incomplete" });
    } catch (err) {
        console.error("Error toggling task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/completed-tasks', async (req, res) => {
    const userEmail = req.session.userEmail;
    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const userResult = await db.query("SELECT userid FROM users WHERE email = $1", [userEmail]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].userid;

        const result = await db.query(
            `SELECT * FROM completed_tasks WHERE user_id = $1 ORDER BY completed_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching completed tasks:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // This is the default session cookie name
        res.json({ success: true });
    });
});