// backend/routes/bids.js
const express = require("express");
const { authenticateToken, authorizeRole } = require("./authMiddleware");
const db = require("./db"); // Your database pool connection
const { createNotification } = require("./notifications");

const router = express.Router();

// Freelancer submits a bid
router.post("/", authenticateToken, authorizeRole(["freelancer"]), async (req, res) => {
    try {
        const { project_id, amount, proposal, delivery_days } = req.body;
        const freelancer_id = req.user.userId;

        if (!project_id || amount === undefined || !proposal || delivery_days === undefined) {
            return res.status(400).json({ error: "Missing required fields: project_id, amount, proposal, delivery_days" });
        }
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: "Bid amount must be a positive number." });
        }
        if (typeof delivery_days !== 'number' || delivery_days <= 0) {
            return res.status(400).json({ error: "Delivery days must be a positive number." });
        }
        if (typeof proposal !== 'string' || proposal.trim().length === 0) {
            return res.status(400).json({ error: "Proposal message cannot be empty." });
        }

        const [projectStatus] = await db.query("SELECT project_status FROM projects WHERE id = ?", [project_id]);
        if (projectStatus.length === 0) {
            return res.status(404).json({ error: "Project not found." });
        }
        if (projectStatus.length > 0 && projectStatus[0].project_status !== 'open') {
            return res.status(400).json({ error: "Cannot bid on a project that is not open." });
        }

        const [existingBids] = await db.query(
            "SELECT id FROM bids WHERE project_id = ? AND freelancer_id = ?",
            [project_id, freelancer_id]
        );
        if (existingBids.length > 0) {
            return res.status(400).json({ error: "You have already placed a bid on this project." });
        }

         const [result] = await db.query(
            // CORRECTED: Ensure the values array matches the placeholders and columns EXACTLY
            "INSERT INTO bids (project_id, freelancer_id, bid_amount, proposal, delivery_days, status) VALUES (?, ?, ?, ?, ?, ?)",
            [project_id, freelancer_id, amount, proposal, delivery_days, 'pending'] // <-- Corrected: added freelancer_id
        );

        const newBidId = result.insertId;


        const [project] = await db.query("SELECT client_id, title FROM projects WHERE id = ?", [project_id]);
        if (project.length > 0) {
            const clientUserId = project[0].client_id;
            const projectTitle = project[0].title;
            const notificationMessage = `A new bid has been submitted for your project "${projectTitle}".`;
            await createNotification(clientUserId, notificationMessage, 'new_bid', project_id, newBidId);
        }

        res.status(201).json({ message: "Bid submitted successfully!", bidId: newBidId });
    } catch (error) {
        console.error("Error submitting bid:", error);
        res.status(500).json({ error: "Failed to submit bid", details: error.message });
    }
});

// Get bids made by the logged-in freelancer
router.get("/my-bids", authenticateToken, authorizeRole(["freelancer"]), async (req, res) => {
    const freelancerId = req.user.userId;

    try {
        const [bids] = await db.query(
            `SELECT
                b.id,
                b.project_id,
                b.bid_amount,
                b.proposal AS cover_letter,  -- Corrected: Map 'proposal' to 'cover_letter' for frontend consistency
                b.created_at AS bid_date,    -- Corrected: Map 'created_at' to 'bid_date'
                b.status AS bid_status,      -- Corrected: Map 'status' to 'bid_status'
                b.delivery_days,             -- Added: Include delivery_days
                p.title AS project_title,
                p.description AS project_description,
                p.budget AS project_budget,
                p.deadline AS project_deadline
            FROM bids b
            JOIN projects p ON b.project_id = p.id
            WHERE b.freelancer_id = ?
            ORDER BY b.created_at DESC`,  
            [freelancerId]
        );

        res.json(bids);
    } catch (error) {
        console.error("Error fetching freelancer bids:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get bids for a specific project (for the client)
router.get("/project/:projectId", authenticateToken, authorizeRole(["client"]), async (req, res) => {
    try {
        const { projectId } = req.params;
        const clientId = req.user.userId;
        const [projectData] = await db.query("SELECT id, title, description, budget, project_status, client_id FROM projects WHERE id = ?", [projectId]);
        if (projectData.length === 0 || projectData[0].client_id !== clientId) {
            return res.status(403).json({ error: "Unauthorized to view bids for this project" });
        }
        const project = projectData[0];

        const [bids] = await db.query(`
            SELECT
                b.id,
                b.freelancer_id,
                b.bid_amount,
                b.proposal,
                b.delivery_days,
                b.status,
                b.created_at,
                u.username AS freelancer_username,
                u.rating AS freelancer_rating
            FROM bids b
            JOIN users u ON b.freelancer_id = u.id
            WHERE b.project_id = ?
            ORDER BY b.bid_amount ASC
        `, [projectId]);

        res.json({ project, bids });
    } catch (error) {
        console.error("Error fetching bids:", error);
        res.status(500).json({ error: "Failed to fetch bids", details: error.message });
    }
});

// Client accepts a bid
router.post("/:bidId/accept", authenticateToken, authorizeRole(["client"]), async (req, res) => {
    const { bidId } = req.params;
    const clientId = req.user.userId;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [bidsResult] = await connection.query(
            "SELECT b.id, b.project_id, b.status, p.client_id, p.project_status AS current_project_status, b.freelancer_id FROM bids b JOIN projects p ON b.project_id = p.id WHERE b.id = ?",
            [bidId]
        );

        if (bidsResult.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: "Bid not found." });
        }

        const bid = bidsResult[0];
        const projectId = bid.project_id;
        const winningFreelancerId = bid.freelancer_id;

        if (bid.client_id !== clientId) {
            await connection.rollback();
            connection.release();
            return res.status(403).json({ error: "Forbidden: You do not own this project." });
        }

        if (bid.status !== 'pending') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: `Bid cannot be accepted: It is already '${bid.status}'.` });
        }
        if (bidsResult[0].current_project_status !== 'open') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: `Project is already '${bidsResult[0].current_project_status}'. Cannot accept new bids.` });
        }

        const [projectTitleResult] = await connection.query("SELECT title FROM projects WHERE id = ?", [projectId]);
        const projectTitle = projectTitleResult.length > 0 ? projectTitleResult[0].title : "Unknown Project";

        await connection.query(
            "UPDATE bids SET status = 'accepted' WHERE id = ?",
            [bidId]
        );

        const [rejectedBids] = await connection.query(
            "SELECT freelancer_id FROM bids WHERE project_id = ? AND id != ? AND status = 'pending'",
            [projectId, bidId]
        );
        await connection.query("UPDATE bids SET status = 'rejected' WHERE project_id = ? AND id != ? AND status = 'pending'", [projectId, bidId]);

        await connection.query(
            "UPDATE projects SET project_status = 'assigned', assigned_freelancer_id = ? WHERE id = ?",
            [winningFreelancerId, projectId]
        );

        await connection.commit();
        connection.release();

        const winningMessage = `Congratulations! Your bid for "${projectTitle}" has been accepted.`;
        await createNotification(winningFreelancerId, winningMessage, 'bid_accepted', projectId, bidId);

        for (const rejectedBid of rejectedBids) {
            const rejectedMessage = `Your bid for "${projectTitle}" was not accepted.`;
            await createNotification(rejectedBid.freelancer_id, rejectedMessage, 'bid_rejected', projectId, null);
        }

        res.status(200).json({ message: "Bid accepted successfully!", acceptedBidId: bidId });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error accepting bid:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Client rejects a bid
router.post("/:bidId/reject", authenticateToken, authorizeRole(["client"]), async (req, res) => {
    try {
        const { bidId } = req.params;
        const clientId = req.user.userId;

        const [bidsResult] = await db.query(
            "SELECT b.id, b.project_id, b.status, p.client_id, b.freelancer_id FROM bids b JOIN projects p ON b.project_id = p.id WHERE b.id = ?",
            [bidId]
        );
        if (bidsResult.length === 0) {
            return res.status(404).json({ error: "Bid not found" });
        }
        const bid = bidsResult[0];
        const projectId = bid.project_id;
        const freelancerId = bid.freelancer_id;

        if (bid.client_id !== clientId) {
            return res.status(403).json({ error: "Unauthorized to reject bid for this project" });
        }

        if (bid.status !== 'pending') {
            return res.status(400).json({ error: `Bid cannot be rejected: It is already '${bid.status}'.` });
        }

        const [projectTitleResult] = await db.query("SELECT title FROM projects WHERE id = ?", [projectId]);
        const projectTitle = projectTitleResult.length > 0 ? projectTitleResult[0].title : "Unknown Project";

        await db.query("UPDATE bids SET status = 'rejected' WHERE id = ?", [bidId]);

        const message = `Your bid for "${projectTitle}" has been rejected.`;
        await createNotification(freelancerId, message, 'bid_rejected', projectId, bidId);

        res.status(200).json({ message: "Bid rejected successfully!" });
    } catch (error) {
        console.error("Error rejecting bid:", error);
        res.status(500).json({ error: "Failed to reject bid", details: error.message });
    }
});

// Get freelancer's specific bid for a project (for checking if they already bid)
router.get("/freelancer/:projectId", authenticateToken, authorizeRole(["freelancer"]), async (req, res) => {
    try {
        const { projectId } = req.params;
        const freelancer_id = req.user.userId;

        const [bid] = await db.query(
            "SELECT id, bid_amount, proposal, delivery_days, status FROM bids WHERE project_id = ? AND freelancer_id = ?",
            [projectId, freelancer_id]
        );

        res.json(bid.length > 0 ? bid[0] : null);
    } catch (error) {
        console.error("Error fetching freelancer's bid:", error);
        res.status(500).json({ error: "Failed to fetch freelancer's bid", details: error.message });
    }
});

module.exports = router;