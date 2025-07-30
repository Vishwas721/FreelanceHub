// controllers/projectController.js
const express = require("express");
const db = require('./db');

// ... existing functions ...

// New: Client accepts project
exports.acceptProject = async (req, res) => {
    const { projectId } = req.params;
    const clientId = req.user.userId; // From authenticateToken middleware

    let connection; // Declare a variable to hold the connection

    try {
        // Get a connection from the pool
        connection = await db.getConnection(); // Correct way to get a connection for a transaction

        // Start transaction on the obtained connection
        await connection.beginTransaction();

        const [projectRows] = await connection.query( // Use connection.query
            "SELECT client_id, project_status, assigned_freelancer_id, budget FROM projects WHERE id = ?",
            [projectId]
        );

        if (projectRows.length === 0) {
            await connection.rollback(); // Rollback on this connection
            return res.status(404).json({ error: "Project not found." });
        }

        const project = projectRows[0];

        if (project.client_id !== clientId) {
            await connection.rollback(); // Rollback on this connection
            return res.status(403).json({ error: "Forbidden: You are not the client for this project." });
        }

        // Project must be 'submitted' or 'completed_pending_review' to be accepted
        if (project.project_status !== 'submitted' && project.project_status !== 'completed_pending_review') {
            await connection.rollback(); // Rollback on this connection
            return res.status(400).json({ error: `Project status is '${project.project_status}'. Only 'submitted' or 'completed_pending_review' projects can be accepted.` });
        }

        // 1. Update project status to 'completed'
        await connection.query( // Use connection.query
            "UPDATE projects SET project_status = 'completed' WHERE id = ?",
            [projectId]
        );

        // 2. Mark corresponding bid as 'completed' (assuming there's an accepted bid for the assigned freelancer)
        if (project.assigned_freelancer_id) {
            await connection.query( // Use connection.query
                "UPDATE bids SET status = 'completed' WHERE project_id = ? AND freelancer_id = ? AND status = 'accepted'",
                [projectId, project.assigned_freelancer_id]
            );
        }

        // 3. (Optional but recommended): Implement payment processing logic here.
        console.log(`Payment of $${project.budget} to freelancer ${project.assigned_freelancer_id} for project ${projectId} would be processed here.`);

        // Commit the transaction on the obtained connection
        await connection.commit();
        res.status(200).json({ message: "Project accepted successfully! Payment released to freelancer." });

    } catch (error) {
        if (connection) { // Only try to rollback if a connection was successfully obtained
            await connection.rollback(); // Rollback on this connection
        }
        console.error("Error accepting project:", error);
        res.status(500).json({ error: "Internal server error during project acceptance." });
    } finally {
        if (connection) { // Always release the connection in the finally block
            connection.release();
        }
    }
};

exports.getAssignedProjectsForFreelancer = async (req, res) => {
    try {
        const freelancerId = req.user.userId;

        const [assignedProjects] = await db.query(
            `SELECT
                p.id,
                p.title,
                p.description,
                p.budget,
                p.deadline,
                p.project_status,
                p.created_at,
                p.client_id,
                u.username AS client_username,
                u.email AS client_email
            FROM projects p
            JOIN users u ON p.client_id = u.id
            WHERE p.assigned_freelancer_id = ?
              AND p.project_status IN ('assigned', 'in_progress', 'completed_pending_review', 'completed') -- <--- ADDED 'completed' HERE
            ORDER BY p.deadline ASC`,
            [freelancerId]
        );

        res.json(assignedProjects);
    } catch (error) {
        console.error("Error fetching assigned projects for freelancer:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};


// New: Client requests revisions
exports.requestRevisions = async (req, res) => {
    const { projectId } = req.params;
    const { revisionMessage } = req.body;
    const clientId = req.user.userId; // From authenticateToken middleware

    if (!revisionMessage || revisionMessage.trim() === '') {
        return res.status(400).json({ error: "Revision message is required." });
    }

    try {
        const [projectRows] = await db.query(
            "SELECT client_id, project_status, assigned_freelancer_id FROM projects WHERE id = ?",
            [projectId]
        );

        if (projectRows.length === 0) {
            return res.status(404).json({ error: "Project not found." });
        }

        const project = projectRows[0];

        if (project.client_id !== clientId) {
            return res.status(403).json({ error: "Forbidden: You are not the client for this project." });
        }

        // Project must be 'submitted' or 'completed_pending_review' to request revisions
        if (project.project_status !== 'submitted' && project.project_status !== 'completed_pending_review') {
            return res.status(400).json({ error: `Project status is '${project.project_status}'. Only 'submitted' or 'completed_pending_review' projects can have revisions requested.` });
        }

        // Determine target status. If it was 'submitted', it should go back to 'in_progress' or 'assigned'.
        // Let's assume 'in_progress' is a good state for revisions.
        const newStatus = 'in_progress';

        await db.query(
            "UPDATE projects SET project_status = ?, revision_notes = ? WHERE id = ?",
            [newStatus, revisionMessage, projectId]
        );

        // Optional: Notify the freelancer that revisions are requested. (Requires notification system)
        console.log(`Revision requested for project ${projectId}. Message: "${revisionMessage}"`);

        res.status(200).json({ message: `Revisions requested successfully. Project status updated to '${newStatus}'.` });

    } catch (error) {
        console.error("Error requesting revisions:", error);
        res.status(500).json({ error: "Internal server error during revision request." });
    }
};

// ... rest of projectController.js
