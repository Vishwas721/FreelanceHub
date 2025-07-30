const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db"); // This is your promise-based pool
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const { authenticateToken, isAdmin } = require("./authMiddleware");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) { // Added check for req.user
            return res.sendStatus(403);
        }
        next();
    };
};

// Register User
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, role]
        );

        res.json({ message: "User registered successfully!", role });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});




router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        // --- IMPORTANT FIX HERE ---
        // Include username and userId in the response for the frontend AuthContext
        res.json({
            message: "Login successful!",
            token,
            role: user.role,
            username: user.username, // Added username
            userId: user.id          // Added userId
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});


// Assign admin role
router.post("/assign-admin", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        const [result] = await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [userId]);
        res.json({ message: "User promoted to admin!" });
    } catch (error) {
        console.error("Assign admin error:", error);
        res.status(500).json({ error });
    }
});


router.post("/google-login", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Google token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length > 0) {
            const user = users[0];
            const jwtToken = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            // --- IMPORTANT FIX HERE (Existing Google user) ---
            return res.json({
                message: "Google Login successful!",
                token: jwtToken,
                role: user.role,
                username: user.username, // Added username from existing user
                userId: user.id          // Added userId from existing user
            });
        } else {
            // New Google user registration
            const [result] = await db.query(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, "", "freelancer"] // Assuming new Google users start as 'freelancer'
            );

            const newUser = { // Create an object for the newly inserted user's data
                id: result.insertId,
                username: name,
                role: "freelancer"
            };

            const jwtToken = jwt.sign(
                { userId: newUser.id, role: newUser.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            // --- IMPORTANT FIX HERE (New Google user signup) ---
            return res.json({
                message: "Google Signup successful!",
                token: jwtToken,
                role: newUser.role,
                username: newUser.username, // Added username
                userId: newUser.id          // Added userId
            });
        }
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ error: "Invalid Google token" });
    }
});


router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query("SELECT username, email, role FROM users WHERE id = ?", [req.user.userId]);
        res.json(result[0]);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error });
    }
});

// Update profile
router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { username, email } = req.body;
        await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, req.user.userId]);
        res.json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error });
    }
});


router.post("/switch-role", authenticateToken, async (req, res) => { // Added authenticateToken
    try {
        const { newRole } = req.body;
        const userId = req.user.userId; // Get userId from the authenticated token

        if (!["client", "freelancer"].includes(newRole)) {
            return res.status(400).json({ error: "Invalid role selection" });
        }

        await db.query("UPDATE users SET role = ? WHERE id = ?", [newRole, userId]);

        // Fetch the updated user data to include the new role in the token
        const [updatedUsers] = await db.query("SELECT id, role FROM users WHERE id = ?", [userId]);
        const updatedUser = updatedUsers[0];

        // Generate a new JWT with the updated role
        const token = jwt.sign(
            { userId: updatedUser.id, role: updatedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Role switched successfully!", newRole, token }); // Send the new token back
    } catch (error) {
        console.error("Switch role error:", error);
        res.status(500).json({ error: "Database update failed" });
    }
});


// --- Dashboard Stats Endpoints ---
router.get('/client/stats', authenticateToken, authorizeRole(['client']), async (req, res) => {
    try {
        const clientId = req.user.userId;
        const [projectsPostedResult] = await db.query("SELECT COUNT(*) AS count FROM projects WHERE client_id = ?", [clientId]);
        const projectsPosted = projectsPostedResult[0].count;
        const [bidsReceivedResult] = await db.query("SELECT COUNT(b.id) AS count FROM bids b JOIN projects p ON b.project_id = p.id WHERE p.client_id = ?", [clientId]);
        const bidsReceived = bidsReceivedResult[0].count;
        const [projectsInProgressResult] = await db.query("SELECT COUNT(*) AS count FROM projects WHERE client_id = ? AND project_status = 'in_progress'", [clientId]);
        const projectsInProgress = projectsInProgressResult[0].count;
        res.json({ projectsPosted, bidsReceived, projectsInProgress });
    } catch (error) {
        console.error('Error fetching client stats:', error);
        res.status(500).json({ message: 'Failed to fetch client stats', error: error.message });
    }
});

// Freelancer-specific stats
router.get('/freelancer/stats', authenticateToken, authorizeRole(['freelancer']), async (req, res) => {
    try {
        const freelancerId = req.user.userId;
        const [bidsPlacedResult] = await db.query("SELECT COUNT(*) AS count FROM bids WHERE freelancer_id = ?", [freelancerId]);
        const bidsPlaced = bidsPlacedResult[0].count;

        const query2 = "SELECT COUNT(project_id) AS count FROM bids WHERE freelancer_id = ? AND bid_status = 'accepted'";
        console.log("Executing SQL:", query2, [freelancerId]);
        const [projectsWorkingOnResult] = await db.query(query2, [freelancerId]);
        const projectsWorkingOn = projectsWorkingOnResult[0].count;

        const query3 = "SELECT SUM(bid_amount) AS total FROM bids WHERE freelancer_id = ? AND bid_status = 'accepted'";
        console.log("Executing SQL:", query3, [freelancerId]);
        const [earningsResult] = await db.query(query3, [freelancerId]);
        const earnings = earningsResult[0].total || 0;

        res.json({ bidsPlaced, projectsWorkingOn, earnings });
    } catch (error) {
        console.error('Error fetching freelancer stats:', error);
        res.status(500).json({ message: 'Failed to fetch freelancer stats', error: error.message });
    }
});

// Admin-specific stats (example)
router.get('/admin/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [totalUsersResult] = await db.query("SELECT COUNT(*) AS count FROM users");
        const totalUsers = totalUsersResult[0].count;
        const [totalProjectsResult] = await db.query("SELECT COUNT(*) AS count FROM projects");
        const totalProjects = totalProjectsResult[0].count;
        const [totalBidsResult] = await db.query("SELECT COUNT(*) AS count FROM bids");
        const totalBids = totalBidsResult[0].count;
        res.json({ totalUsers, totalProjects, totalBids });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
});

// --- Activity Feed Endpoints ---

// Client-specific activity
router.get('/client/activity', authenticateToken, authorizeRole(['client']), async (req, res) => {
    try {
        const clientId = req.user.userId;
        const [recentBidsResult] = await db.query(`
            SELECT b.*, u.username AS freelancer_username, p.title AS project_title
            FROM bids b
            JOIN projects p ON b.project_id = p.id
            JOIN users u ON b.freelancer_id = u.id
            WHERE p.client_id = ?
            ORDER BY b.created_at DESC
            LIMIT 10
        `, [clientId]);
        res.json(recentBidsResult);
    } catch (error) {
        console.error('Error fetching client activity:', error);
        res.status(500).json({ message: 'Failed to fetch client activity', error: error.message });
    }
});

// Freelancer-specific activity
router.get('/freelancer/activity', authenticateToken, authorizeRole(['freelancer']), async (req, res) => {
    try {
        const [recentProjectsResult] = await db.query(`
            SELECT *
            FROM projects
            WHERE project_status = 'open'
            ORDER BY created_at DESC
            LIMIT 10
        `);
        res.json(recentProjectsResult);
    } catch (error) {
        console.error('Error fetching freelancer activity:', error);
        res.status(500).json({ message: 'Failed to fetch freelancer activity', error: error.message });
    }
});

// Admin-specific activity (example)
router.get('/admin/activity', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const [recentUsersResult] = await db.query("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5");
        const [recentProjectsResult] = await db.query("SELECT id, title, client_id, project_status, created_at FROM projects ORDER BY created_at DESC LIMIT 5");
        res.json({ recentUsers: recentUsersResult, recentProjects: recentProjectsResult });
    } catch (error) {
        console.error('Error fetching admin activity:', error);
        res.status(500).json({ message: 'Failed to fetch admin activity', error: error.message });
    }
});

module.exports = router;