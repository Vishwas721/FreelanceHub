const express = require("express");
const router = express.Router();
const db = require("./db");
const { authenticateToken, authorizeRole } = require("./authMiddleware");

// General activity feed (if you still want it)
router.get("/activity", authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query("SELECT message, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 10");
        res.json(result);
    } catch (err) {
        console.error("Error fetching activity logs:", err);
        return res.status(500).json({ error: "Failed to fetch activity logs", details: err.message });
    }
});

// Client-specific activity feed
router.get("/client/activity", authenticateToken, authorizeRole(["client"]), async (req, res) => {
    const userId = req.user.userId;
    try {
        // Fetch activities relevant to the client (e.g., bids on their projects)
        const [result] = await db.query(`
            SELECT
                b.id AS bid_id,
                b.bid_amount,
                b.proposal,
                b.created_at,
                u.username AS freelancer_username,
                p.title AS project_title
            FROM bids b
            JOIN users u ON b.freelancer_id = u.id
            JOIN projects p ON b.project_id = p.id
            WHERE p.client_id = ?
            ORDER BY b.created_at DESC
            LIMIT 10
        `, [userId]);
        res.json(result);
    } catch (err) {
        console.error("Error fetching client activity:", err);
        return res.status(500).json({ error: "Failed to fetch client activity", details: err.message });
    }
});

// Freelancer-specific activity feed
router.get("/freelancer/activity", authenticateToken, authorizeRole(["freelancer"]), async (req, res) => {
    const userId = req.user.userId;
    try {
        // Fetch activities relevant to the freelancer (e.g., new projects posted)
        const [result] = await db.query(`
            SELECT
                p.id AS project_id,
                p.title,
                p.description,
                p.budget,
                p.created_at
            FROM projects p
            WHERE p.project_status = 'open'
            ORDER BY p.created_at DESC
            LIMIT 10
        `);
        res.json(result);
    } catch (err) {
        console.error("Error fetching freelancer activity:", err);
        return res.status(500).json({ error: "Failed to fetch freelancer activity", details: err.message });
    }
});

// Admin-specific activity feed
router.get("/admin/activity", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
    try {
        // Fetch admin-relevant activities (e.g., new user registrations, new projects)
        const [userRegistrations] = await db.query(`
            SELECT id, username, email, 'new_user' AS type, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 5
        `);
        const [newProjects] = await db.query(`
            SELECT id, title, 'new_project' AS type, created_at
            FROM projects
            ORDER BY created_at DESC
            LIMIT 5
        `);
        const combinedActivities = [...userRegistrations, ...newProjects]
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, 10);

        res.json(combinedActivities);
    } catch (err) {
        console.error("Error fetching admin activity:", err);
        return res.status(500).json({ error: "Failed to fetch admin activity", details: err.message });
    }
});

module.exports = router;