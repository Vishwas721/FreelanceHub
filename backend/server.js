// backend/server.js

const express = require("express");
const cors = require("cors");
const path = require('path');
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRoutes = require("./authRoutes");
const projectRoutes = require("./projectRoutes");
const bidRoutes = require("./bidRoutes");
const paymentRoutes = require("./paymentRoutes");
const adminRoutes = require("./adminRoutes");
const activityRoutes = require("./activityRoutes");
const statsRoutes = require("./statsRoutes");
const userRoutes = require("./userRoutes");
const db = require("./db"); // Assuming db.js exports your MySQL connection pool
const { authenticateToken } = require("./authMiddleware");
const deliverableRoutes = require('./deliverableRoutes');
const widgetRoutes = require("./widgetRoutes");
const notificationsRoutes = require("./notificationsRoutes");

const app = express();
const PORT = 5000;

// --- Global Middleware (ORDER MATTERS!) ---

// 1. CORS Middleware (should be very early)
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body Parsers (for JSON and URL-encoded data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Low-Level Request Logger (for debugging, place after basic middleware)
app.use((req, res, next) => {
    console.log(`[SERVER] Incoming Request: ${req.method} ${req.url}`);
    next();
});

// --- Public Routes (no token needed, place before authenticateToken) ---
app.use("/api/auth", authRoutes);
app.use("/api", activityRoutes); // Consider if this truly needs to be public

// NEW: Public User Search API Endpoint
app.get('/api/users/search', async (req, res) => {
    const query = req.query.q; // Get the search query from URL params (e.g., ?q=web%20dev)

    if (!query) {
        // If no query is provided, return an empty array or a message
        return res.json([]); // Or res.status(400).json({ message: 'Search query is required.' });
    }

    const searchQuery = `%${query}%`; // Prepare query for LIKE operator

    try {
        // Adjust the SELECT fields to match your 'users' table structure
        // Ensure 'role' is included if you want to filter/display based on it
        const [rows] = await db.query(
            `SELECT id, username, email, role, rating, location, bio, company_name, industry, skills, hourly_rate, portfolio_link
             FROM users
             WHERE username LIKE ?
                OR email LIKE ?
                OR skills LIKE ?
                OR role LIKE ?
                OR industry LIKE ?
                OR bio LIKE ?
             ORDER BY username ASC`, // Order results for consistency
            [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
        );
        res.json(rows);
    } catch (error) {
        console.error('Database query error (User Search):', error);
        res.status(500).json({ message: 'Error fetching users from the database.', details: error.message });
    }
});

// 4. Authentication Middleware (applies to all routes defined AFTER this line)
app.use(authenticateToken); // All routes below this will require a token

// 5. Serve static files from the 'uploads' directory
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));
console.log(`[SERVER] Serving static files from: ${uploadDir} at /uploads URL prefix`);

// --- Protected Routes ---
app.use('/api/users', userRoutes); // This might contain other user-related routes that are protected
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", statsRoutes);
app.use("/api/widgets", widgetRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use('/api/deliverables', deliverableRoutes);

// --- Debug/Test Routes ---
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!" });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json({ message: "✅ Database is working!", data: rows });
    } catch (err) {
        return res
            .status(500)
            .json({ error: "Database test failed", details: err.message });
    }
});

// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
