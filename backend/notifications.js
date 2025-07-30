// utils/notifications.js
const db = require("./db");

const createNotification = async (userId, message, type = 'system', projectId = null, bidId = null) => {
    // Determine related_entity_id: prioritize bidId, then projectId
    const relatedEntityId = bidId || projectId; // This will be NULL if both are NULL

    try {
        await db.query(
            "INSERT INTO notifications (user_id, message, type, related_entity_id, project_id, bid_id) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, message, type, relatedEntityId, projectId, bidId] // Ensure all 6 parameters are passed
        );
        console.log(`Notification created: Type='${type}', Message='${message}' for user ${userId}, ProjectID: ${projectId}, BidID: ${bidId}`); // Added more detailed log
    } catch (error) {
        console.error(`Error creating notification for user ${userId}:`, error);
    }
};

module.exports = { createNotification };