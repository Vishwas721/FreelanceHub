const express = require("express");
const router = express.Router();
const db = require("./db"); // Assuming this is your database connection
const { authenticateToken } = require("./authMiddleware"); // Your JWT authentication middleware

// 1. GET /api/notifications
// Fetches all notifications for the authenticated user, ordered by creation date.
// This endpoint is used by the NotificationsPage to display the full list.
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing user ID in token." });
        }

        // Fetch all notifications for the user, ordered by creation date descending
        // Ensure all relevant columns are selected to match your schema
        const [notifications] = await db.query(
            "SELECT id, user_id, message, type, related_entity_id, is_read, created_at, read_at, project_id, bid_id FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 2. POST /api/notifications/mark-as-read
// Marks one or more notifications as read for the authenticated user.
router.post("/mark-as-read", authenticateToken, async (req, res) => {
    try {
        const { notificationIds } = req.body; // Expects an array of notification IDs
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing user ID in token." });
        }

        if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return res.status(400).json({ error: "Notification IDs (array) are required." });
        }

        // Convert array of IDs to a comma-separated string for the IN clause
        const idPlaceholders = notificationIds.map(() => '?').join(',');

        // Update notifications, ensuring they belong to the current user and are not already read
        const [result] = await db.query(
            `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id IN (${idPlaceholders}) AND user_id = ? AND is_read = FALSE`,
            [...notificationIds, userId] // Spread the IDs, then add userId
        );

        // `result.affectedRows` will tell you how many rows were updated
        res.status(200).json({ message: `${result.affectedRows} notifications marked as read.` });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 3. GET /api/notifications/unread-count
// Returns the count of unread notifications for the authenticated user.
// This endpoint is used by AuthContext for the badge count.
router.get("/unread-count", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing user ID in token." });
        }

        const [rows] = await db.query(
            "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE",
            [userId]
        );

        const unreadCount = rows[0].count;
        res.json({ count: unreadCount });
    } catch (error) {
        console.error("Error fetching unread notification count:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// 4. GET /api/notifications/recent
// Fetches the N most recent notifications for the authenticated user.
// This endpoint is intended for the floating panel on the dashboard.
router.get("/recent", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing user ID in token." });
        }

        // Get the limit from query parameters, default to 3
        const limit = parseInt(req.query.limit) || 3;
        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({ error: "Invalid limit provided." });
        }

        // Fetch recent notifications for the user, ordered by creation date descending, with a limit
        const [notifications] = await db.query(
            "SELECT id, user_id, message, type, related_entity_id, is_read, created_at, read_at, project_id, bid_id FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            [userId, limit]
        );

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching recent notifications:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;