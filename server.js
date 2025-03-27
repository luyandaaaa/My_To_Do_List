import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import cors from "cors";
import session from 'express-session';
import { promises as fs } from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = 'data.json';

// Initialize data file with proper structure
async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
        const data = await readData();
        if (!data.users || !data.tasks) {
            await fs.writeFile(DATA_FILE, JSON.stringify({
                users: [],
                tasks: {}
            }, null, 2));
        }
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({
            users: [],
            tasks: {}
        }, null, 2));
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(session({
    secret: 'WsfhWxg12g',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Read data helper
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data file:", err);
        return { users: [], tasks: {} };
    }
}

// Write data helper
async function writeData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing data file:", err);
        throw err;
    }
}

// Initialize data file on startup
initializeDataFile().catch(console.error);

// Serve static files
app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/:page.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", `${req.params.page}.html`));
});

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const data = await readData();
        const user = data.users.find(u => u.email === email);
        
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        req.session.userId = user.id;
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
        const data = await readData();
        
        if (data.users.some(u => u.email === email)) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword
        };

        data.users.push(newUser);
        data.tasks[newUser.id] = {
            work: [],
            personal: [],
            shopping: [],
            health: [],
            completed: []
        };

        await writeData(data);
        req.session.userId = newUser.id;
        res.json({ success: true, redirect: "/home.html" });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get user data
app.get("/user", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        const user = data.users.find(u => u.id === userId);
        
        if (user) {
            res.json({ name: user.name, email: user.email });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create task
app.post('/tasks', async (req, res) => {
    const { name, category, date, startTime, endTime, description } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        
        if (!['work', 'personal', 'shopping', 'health'].includes(category)) {
            return res.status(400).json({ error: "Invalid category" });
        }

        const newTask = {
            id: Date.now().toString(),
            name,
            date,
            startTime,
            endTime,
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (!data.tasks[userId]) {
            data.tasks[userId] = {
                work: [],
                personal: [],
                shopping: [],
                health: [],
                completed: []
            };
        }

        data.tasks[userId][category].push(newTask);
        await writeData(data);
        
        res.status(201).json(newTask);
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        const userTasks = data.tasks[userId] || {
            work: [],
            personal: [],
            shopping: [],
            health: [],
            completed: []
        };
        
        res.json({
            work: userTasks.work || [],
            personal: userTasks.personal || [],
            shopping: userTasks.shopping || [],
            health: userTasks.health || []
        });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete task
app.delete('/tasks/:category/:id', async (req, res) => {
    const { category, id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        
        if (!data.tasks[userId] || !data.tasks[userId][category]) {
            return res.status(404).json({ error: "Category not found" });
        }

        const taskIndex = data.tasks[userId][category].findIndex(t => t.id === id);
        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }

        data.tasks[userId][category].splice(taskIndex, 1);
        await writeData(data);
        
        res.json({ success: true, message: "Task deleted" });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update task
app.put('/tasks/:category/:id', async (req, res) => {
    const { category, id } = req.params;
    const { name, date, startTime, endTime, description } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        
        if (!data.tasks[userId] || !data.tasks[userId][category]) {
            return res.status(404).json({ error: "Category not found" });
        }

        const taskIndex = data.tasks[userId][category].findIndex(t => t.id === id);
        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Update task properties
        const task = data.tasks[userId][category][taskIndex];
        task.name = name || task.name;
        task.date = date || task.date;
        task.startTime = startTime || task.startTime;
        task.endTime = endTime || task.endTime;
        task.description = description || task.description;

        await writeData(data);
        
        res.json({ 
            success: true, 
            message: "Task updated successfully",
            task: task,
            category: category
        });
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ 
            error: "Internal server error",
            details: err.message 
        });
    }
});

// Toggle task completion
app.patch('/tasks/:category/:id/toggle', async (req, res) => {
    const { category, id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        
        if (!data.tasks[userId] || !data.tasks[userId][category]) {
            return res.status(404).json({ error: "Category not found" });
        }

        const taskIndex = data.tasks[userId][category].findIndex(t => t.id === id);
        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }

        const task = data.tasks[userId][category][taskIndex];
        task.completed = !task.completed;

        if (task.completed) {
            // Move to completed
            const completedTask = { 
                ...task, 
                completedAt: new Date().toISOString(),
                originalCategory: category
            };
            data.tasks[userId].completed.push(completedTask);
            data.tasks[userId][category].splice(taskIndex, 1);
        }

        await writeData(data);
        res.json({ success: true, message: "Task status updated" });
    } catch (err) {
        console.error("Error toggling task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get completed tasks
app.get('/completed-tasks', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const data = await readData();
        const completedTasks = data.tasks[userId]?.completed || [];
        res.json(completedTasks);
    } catch (err) {
        console.error("Error fetching completed tasks:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Logout
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