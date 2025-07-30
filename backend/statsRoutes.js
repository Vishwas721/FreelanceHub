// backend/routes/statsRoutes.js
const express = require("express");
const { authenticateToken } = require("./authMiddleware");
const db = require("./db"); // Your database pool connection
const router = express.Router();

// Stats for clients and freelancers
router.get("/stats", authenticateToken, async (req, res) => {
    console.log("Received User for Stats:", req.user); // More specific log

    if (!req.user || !req.user.userId) {
        console.error("Auth Error: req.user is undefined or missing userId for stats request");
        return res.status(401).json({ error: "Unauthorized: No valid user ID found" });
    }

    const userId = req.user.userId;
    const userRole = req.user.role;

    try {
        const stats = {};
        if (userRole === "freelancer") {
            const [bidsPlacedResult] = await db.query("SELECT COUNT(*) AS bidsPlaced FROM bids WHERE freelancer_id = ?", [userId]);
            // CORRECTED: Changed 'bid_status' to 'status' to match your current DB schema
            const [projectsWorkingOnResult] = await db.query("SELECT COUNT(DISTINCT project_id) AS projects FROM bids WHERE freelancer_id = ? AND status = 'accepted'", [userId]);
            const [earningsResult] = await db.query("SELECT SUM(bid_amount) AS earnings FROM bids WHERE freelancer_id = ? AND status = 'accepted'", [userId]); // Assuming 'accepted' means they are working and earning
            stats.bidsPlaced = bidsPlacedResult[0]?.bidsPlaced || 0;
            stats.projectsWorkingOn = projectsWorkingOnResult[0]?.projects || 0;
            stats.earnings = earningsResult[0]?.earnings || 0;
        } else if (userRole === "client") {
            const [projectsPostedResult] = await db.query("SELECT COUNT(*) AS projects FROM projects WHERE client_id = ?", [userId]);
            const [bidsReceivedResult] = await db.query("SELECT COUNT(b.id) AS bids FROM projects p JOIN bids b ON p.id = b.project_id WHERE p.client_id = ?", [userId]);
            const [projectsInProgressResult] = await db.query("SELECT COUNT(*) AS projects FROM projects WHERE client_id = ? AND project_status = 'in progress'", [userId]); // Assuming 'in progress' in projects table
            stats.projects = projectsPostedResult[0]?.projects || 0;
            stats.bidsReceived = bidsReceivedResult[0]?.bids || 0;
            stats.inProgress = projectsInProgressResult[0]?.projects || 0;
        }

        res.json(stats);
    } catch (error) {
        console.error("Database Query Error in statsRoutes:", error); // More specific log
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;