import express from "express";
import path from "path";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import session from 'express-session';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(session({
    secret: process.env.SESSION_SECRET || 'WsfhWxg12g',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve the landing page
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// PostgreSQL connection - using Railway's connection URL
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

db.connect()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Connection error", err.stack));

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        req.session.userEmail = user.email;
        res.json({ success: true, redirect: "/home.html" });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Signup endpoint
app.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );
        
        req.session.userEmail = email;
        res.json({ success: true, redirect: "/home.html" });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// User data endpoint
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

// Tasks endpoints
app.post('/tasks', async (req, res) => {
    const { name, category, date, startTime, endTime, description } = req.body;
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

        let tableName;
        switch (category) {
            case 'work': tableName = 'work_tasks'; break;
            case 'personal': tableName = 'personal_tasks'; break;
            case 'shopping': tableName = 'shopping_tasks'; break;
            case 'health': tableName = 'health_tasks'; break;
            default: return res.status(400).json({ error: "Invalid category" });
        }

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

app.patch('/tasks/:table/:id/toggle', async (req, res) => {
    const { table, id } = req.params;
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

        const taskResult = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found or not owned by user" });
        }

        const task = taskResult.rows[0];
        const isCompleted = task.completed;

        if (!isCompleted) {
            await db.query(
                `INSERT INTO completed_tasks (user_id, task_name, description, category) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, task.task_name, task.description, table.replace("_tasks", "")]
            );

            await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
            return res.json({ success: true, message: "Task moved to completed_tasks", task });
        }

        res.json({ success: true, message: "Task remains incomplete" });
    } catch (err) {
        console.error("Error toggling task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete('/tasks/:table/:id', async (req, res) => {
    const { table, id } = req.params;
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

        // Verify task belongs to user before deleting
        const verifyResult = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found or not owned by user" });
        }

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
    const userEmail = req.session.userEmail;

    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!table || !id || !task_name) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        const userResult = await db.query("SELECT userid FROM users WHERE email = $1", [userEmail]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].userid;

        // Verify task belongs to user before updating
        const verifyResult = await db.query(`SELECT * FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found or not owned by user" });
        }

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

// Completed tasks endpoint
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

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});