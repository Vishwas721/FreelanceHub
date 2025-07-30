const express = require("express");
const router = express.Router();
const db = require("./db");
const { authenticateToken } = require("./authMiddleware"); // Import if you want to protect this

// Save user widget positions (Protected)
router.post("/save-widgets", authenticateToken, async (req, res) => {
    const { userId, widgets } = req.body;
    if (!userId || !widgets) return res.status(400).json({ error: "Invalid input" });

    try {
        await db.promise().query("UPDATE users SET widget_layout = ? WHERE id = ?", [JSON.stringify(widgets), req.user.userId]);
        res.json({ message: "Widgets saved successfully!" });
    } catch (error) {
        console.error("Error saving widgets:", error);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;