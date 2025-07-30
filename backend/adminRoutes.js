const express = require("express");
const { authenticateToken, isAdmin } = require("./authMiddleware");
const db = require("./db");

const router = express.Router();

// View all users (Admin only)
router.get("/users", authenticateToken, isAdmin, (req, res) => {
    db.query("SELECT id, username, email, role FROM users", (err, users) => {
        if (err) return res.status(500).json({ error: err });
        res.json(users);
    });
});

// Assign a new role (Admin only)
router.post("/assign-role", authenticateToken, isAdmin, (req, res) => {
    const { userId, role } = req.body;
    db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: `User role updated to ${role}` });
    });
});

// Admin stats
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
        const [totalUsersResult] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
        const [totalProjectsResult] = await db.query("SELECT COUNT(*) AS totalProjects FROM projects");
        const [totalBidsResult] = await db.query("SELECT COUNT(*) AS totalBids FROM bids");

        res.json({
            totalUsers: totalUsersResult[0]?.totalUsers || 0,
            totalProjects: totalProjectsResult[0]?.totalProjects || 0,
            totalBids: totalBidsResult[0]?.totalBids || 0,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Failed to fetch admin stats", details: error.message });
    }
});

module.exports = router;