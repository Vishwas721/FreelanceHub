// backend/routes/projects.js
const express = require("express");
const { authenticateToken, authorizeRole } = require("./authMiddleware"); // Corrected path to middleware
const db = require("./db"); // Corrected path to db
const { body, validationResult } = require("express-validator");
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Added fs for file deletion
const { createNotification } = require("./notifications"); // Corrected path to notifications
const projectController = require('./projectController'); // Corrected path to controller

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage: storage });

// Custom middleware to handle skillsRequired as an array
const handleSkillsArray = (req, res, next) => {
    if (req.body && req.body.skillsRequired && typeof req.body.skillsRequired === 'string') {
        try {
            // Attempt to parse if it's a stringified array
            req.body.skillsRequired = JSON.parse(req.body.skillsRequired);
        } catch (e) {
            // If it's just a comma-separated string, split it
            req.body.skillsRequired = req.body.skillsRequired.split(',').map(s => s.trim());
        }
    } else if (req.body && req.body.skillsRequired && !Array.isArray(req.body.skillsRequired)) {
        // If it's a single string that's not JSON, put it in an array
        req.body.skillsRequired = [req.body.skillsRequired];
    }
    next();
};

// --- ROUTES ---

// Post a new project (Protected - Client only, with file upload)
router.post(
    "/", // Changed from "/projects"
    authenticateToken,
    authorizeRole(["client"]),
    upload.array('files', 10),
    handleSkillsArray, // Apply the custom middleware here
    [
        body("title").notEmpty().trim().escape().withMessage("Title is required"),
        body("description").notEmpty().trim().escape().withMessage("Description is required"),
        body("budget").notEmpty().isNumeric().trim().escape().withMessage("Budget is required and must be a number"),
        body("deadline").notEmpty().isISO8601().withMessage("Deadline is required and must be a valid date"),
        body("skillsRequired").isArray().notEmpty().withMessage("Skills required must be an array and cannot be empty"),
        body("category").notEmpty().trim().escape().withMessage("Category is required"),
        body("visibility").isIn(['public', 'private']).withMessage("Visibility must be either 'public' or 'private'"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            // Delete uploaded files if validation fails
            if (req.files) {
                req.files.forEach(file => {
                    const filePath = path.join(__dirname, '..', file.path);
                    fs.unlink(filePath, (err) => { // Using fs.unlink
                        if (err) console.error("Error deleting uploaded file:", err);
                    });
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, budget, deadline, category, visibility } = req.body;
        const client_id = req.user.userId;
        const project_status = 'open'; // Default status for new projects

        let filePaths = [];
        if (req.files && req.files.length > 0) {
            filePaths = req.files.map(file => `/uploads/${file.filename}`);
        }
        const filesJson = JSON.stringify(filePaths);
        const skillsRequired = JSON.stringify(req.body.skillsRequired);

        try {
            const [result] = await db.query(
                `
                    INSERT INTO projects (client_id, title, description, budget, files, skills_required, category, visibility, project_status, deadline)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [client_id, title, description, budget, filesJson, skillsRequired, category, visibility, project_status, deadline]
            );

            const projectId = result.insertId;
            const message = `A new project "${title}" has been posted! Check it out.`;
            const notificationType = 'new_project';

            const [freelancers] = await db.query("SELECT id FROM users WHERE role = 'freelancer'");

            for (const freelancer of freelancers) {
                await createNotification(freelancer.id, message, notificationType, projectId, null);
            }

            res.status(201).json({
                message: "Project posted successfully!",
                projectId: projectId,
            });
        } catch (error) {
            console.error("Database error during project creation:", error);
            // If database insertion fails, delete uploaded files
            if (req.files) {
                req.files.forEach(file => {
                    const filePath = path.join(__dirname, '..', file.path);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Error deleting uploaded file on DB error:", err);
                    });
                });
            }
            return res
                .status(500)
                .json({ error: "Database error", details: error.message });
        }
    }
);


// Get all open projects (Protected - Allow both client and freelancer)
router.get("/list", authenticateToken, authorizeRole(['client', 'freelancer']), async (req, res) => { // Changed from "/projects/list"
    try {
        const [projects] = await db.query("SELECT * FROM projects WHERE project_status = 'open'");
        res.json(projects);
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return res.status(500).json({ error: "Failed to fetch projects", details: error.message });
    }
});

// NEW ROUTE: Get recent projects for a freelancer (excluding those they've bid on)
router.get("/recent-for-freelancer", authenticateToken, authorizeRole(['freelancer']), async (req, res) => { // Changed from "/projects/recent-for-freelancer"
    try {
        const freelancerId = req.user.userId;

        const [recentProjects] = await db.query(`
            SELECT p.*, u.username AS client_username
            FROM projects p
            JOIN users u ON p.client_id = u.id
            WHERE p.project_status = 'open'
            AND p.id NOT IN (SELECT project_id FROM bids WHERE freelancer_id = ?)
            ORDER BY p.created_at DESC
            LIMIT 5;
        `, [freelancerId]);

        res.json(recentProjects);

    } catch (error) {
        console.error("Error fetching recent projects for freelancer:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get client's projects (Protected - Client only)
router.get("/my-projects", authenticateToken, authorizeRole(["client"]), async (req, res) => { // Changed from "/projects/my-projects"
    const clientId = req.user.userId;
    try {
        const [projects] = await db.query(
            `SELECT
                p.id,
                p.title,
                p.description,
                p.budget,
                p.project_status,
                p.created_at,
                p.assigned_freelancer_id,
                COUNT(b.id) AS bid_count,
                uf.username AS assigned_freelancer_username
            FROM projects p
            LEFT JOIN bids b ON p.id = b.project_id
            LEFT JOIN users uf ON p.assigned_freelancer_id = uf.id
            WHERE p.client_id = ?
            GROUP BY
                p.id, p.title, p.description, p.budget, p.project_status, p.created_at, p.assigned_freelancer_id, uf.username
            ORDER BY p.created_at DESC`,
            [clientId]
        );
        res.json(projects);
    } catch (error) {
        console.error("Error fetching client's projects:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// GET /api/projects/assigned-to-me (For Freelancers to see their assigned projects)
router.get("/assigned-to-me", authenticateToken, authorizeRole(["freelancer"]), async (req, res) => { // Changed from "/projects/assigned-to-me"
    const freelancerId = req.user.userId;

    try {
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
              AND p.project_status IN ('assigned', 'in_progress', 'completed_pending_review') -- Show relevant statuses
            ORDER BY p.deadline ASC`,
            [freelancerId]
        );

        res.json(assignedProjects);
    } catch (error) {
        console.error("Error fetching assigned projects for freelancer:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get details of a specific project (Protected - Allow both client and freelancer)
router.get("/:id", authenticateToken, authorizeRole(["client", "freelancer"]), async (req, res) => {
    const projectId = req.params.id;
    try {
        const [project] = await db.query(`
            SELECT
                p.id,
                p.title,
                p.description,
                p.budget,
                p.deadline,
                p.files,
                p.skills_required,
                p.category,
                p.visibility,
                p.project_status,
                p.created_at,
                p.client_id,
                p.assigned_freelancer_id,
                uc.username AS client_username,
                uf.username AS assigned_freelancer_username
            FROM projects p
            JOIN users uc ON p.client_id = uc.id
            LEFT JOIN users uf ON p.assigned_freelancer_id = uf.id
            WHERE p.id = ?
        `, [projectId]);

        if (project.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        const fetchedProject = project[0];
        const isClient = req.user.role === 'client' && fetchedProject.client_id === req.user.userId;
        const isAssignedFreelancer = req.user.role === 'freelancer' && fetchedProject.assigned_freelancer_id === req.user.userId;

        // Visibility rules
        if (fetchedProject.visibility === 'private' && !isClient && !isAssignedFreelancer) {
            return res.status(403).json({ error: "Forbidden: This is a private project and you are not authorized to view it." });
        }
        // If project is not 'open', only the client or assigned freelancer should view full details
        if (fetchedProject.project_status !== 'open' && !isClient && !isAssignedFreelancer) {
            return res.status(403).json({ error: "Forbidden: This project is no longer open and you are not authorized to view its details." });
        }

        res.json(fetchedProject);

    } catch (error) {
        console.error("Failed to fetch project details:", error);
        return res.status(500).json({ error: "Failed to fetch project details", details: error.message });
    }
});

// Client accepts a project (marks as 'completed' and triggers payment release)
router.post(
    '/:projectId/accept', // <-- **THIS IS THE CRITICAL CHANGE** (removed /projects)
    authenticateToken,
    authorizeRole(['client']),
    projectController.acceptProject
);

// Client requests revisions on a project (marks as 'in_progress' or 'assigned' again)
router.post(
    '/:projectId/request-revisions', // <-- **THIS IS THE CRITICAL CHANGE** (removed /projects)
    authenticateToken,
    authorizeRole(['client']),
    projectController.requestRevisions
);

// NEW ROUTE: Freelancer marks a project as 'completed_pending_review'
router.post("/:id/mark-for-review", authenticateToken, authorizeRole(["freelancer"]), async (req, res) => {
    const projectId = req.params.id;
    const freelancerId = req.user.userId;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [project] = await connection.query(
            `SELECT id, assigned_freelancer_id, project_status, client_id, title
             FROM projects WHERE id = ?`,
            [projectId]
        );

        if (project.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Project not found." });
        }

        const projectData = project[0];

        if (projectData.assigned_freelancer_id !== freelancerId) {
            await connection.rollback();
            return res.status(403).json({ error: "Forbidden: You are not assigned to this project." });
        }

        // Allow marking for review if status is 'assigned' or 'in_progress'
        if (!['assigned', 'in_progress'].includes(projectData.project_status)) {
            await connection.rollback();
            return res.status(400).json({ error: `Project status is '${projectData.project_status}'. Only 'assigned' or 'in progress' projects can be marked for review.` });
        }

        await connection.query(
            "UPDATE projects SET project_status = 'completed_pending_review' WHERE id = ?",
            [projectId]
        );

        await connection.commit();

        const clientUserId = projectData.client_id;
        const projectTitle = projectData.title;
        const notificationMessage = `Your project "${projectTitle}" has been marked as complete by the freelancer and is awaiting your review.`;
        await createNotification(clientUserId, notificationMessage, 'project_review_needed', projectId, null);

        res.status(200).json({ message: "Project marked for client review successfully!" });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error marking project for review:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// NEW ROUTE: Client approves a project (moves from 'completed_pending_review' to 'completed')
router.post("/:id/approve", authenticateToken, authorizeRole(["client"]), async (req, res) => {
    const projectId = req.params.id;
    const client_id = req.user.userId;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Verify project ownership and status
        const [projectCheck] = await connection.query(
            "SELECT client_id, project_status, assigned_freelancer_id, title FROM projects WHERE id = ?",
            [projectId]
        );

        if (projectCheck.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Project not found." });
        }
        const projectData = projectCheck[0];

        if (projectData.client_id !== client_id) {
            await connection.rollback();
            return res.status(403).json({ error: "Forbidden: You do not own this project." });
        }
        // Only allow approval if project is in 'completed_pending_review'
        if (projectData.project_status !== 'completed_pending_review') {
            await connection.rollback();
            return res.status(400).json({ error: `Project cannot be approved. Current status: ${projectData.project_status}.` });
        }

        // Update project status to 'completed'
        await connection.query(
            "UPDATE projects SET project_status = 'completed' WHERE id = ?",
            [projectId]
        );

        // Optional: Implement payment processing here in a real application

        await connection.commit();

        // Notify the assigned freelancer that the project is completed
        if (projectData.assigned_freelancer_id) {
            const projectTitle = projectData.title;
            const freelancerId = projectData.assigned_freelancer_id;
            const notificationMessage = `Your project "${projectTitle}" has been approved and marked as completed by the client.`;
            await createNotification(freelancerId, notificationMessage, 'project_approved', projectId, null);
        }

        res.status(200).json({ message: "Project approved and marked as completed successfully!" });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error approving project:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// Update an existing project (Protected - Client only, and must be the project owner)
router.put(
    "/:id", // Changed from "/projects/:id"
    authenticateToken,
    authorizeRole(["client"]),
    // You might want to add upload.array('files', 10) and handleSkillsArray here if editing files is allowed
    // and validation for the body fields.
    async (req, res) => {
        const projectId = req.params.id;
        const client_id = req.user.userId; // ID of the logged-in client

        const { title, description, budget, deadline, skillsRequired, category, visibility } = req.body;

        // Basic validation (can be enhanced with express-validator)
        if (!title || !description || budget === undefined || !deadline || !skillsRequired || !category || !visibility) {
            return res.status(400).json({ error: "Missing required fields." });
        }
        if (!Array.isArray(skillsRequired)) { // Ensure skillsRequired is an array (assuming it comes from frontend parsed)
            return res.status(400).json({ error: "Skills required must be an array." });
        }

        try {
            const [projectCheck] = await db.query(
                "SELECT client_id, project_status FROM projects WHERE id = ?",
                [projectId]
            );

            if (projectCheck.length === 0) {
                return res.status(404).json({ error: "Project not found." });
            }

            if (projectCheck[0].client_id !== client_id) {
                return res.status(403).json({ error: "Forbidden: You do not own this project." });
            }

            // Only allow editing if the project is still 'open'
            if (projectCheck[0].project_status !== 'open') {
                return res.status(400).json({ error: "Project cannot be edited as it's no longer open." });
            }

            const skillsJson = JSON.stringify(skillsRequired);

            const [result] = await db.query(
                `
                UPDATE projects
                SET title = ?, description = ?, budget = ?, deadline = ?, skills_required = ?, category = ?, visibility = ?
                WHERE id = ?
                `,
                [title, description, budget, deadline, skillsJson, category, visibility, projectId]
            );

            if (result.affectedRows === 0) {
                return res.status(500).json({ error: "Failed to update project (no rows affected)." });
            }

            res.status(200).json({ message: "Project updated successfully!" });

        } catch (error) {
            console.error("Database error during project update:", error);
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }
);


// Delete a project (Protected - Client only)
router.delete(
    "/delete/:id", // Changed from "/projects/delete/:id"
    authenticateToken,
    authorizeRole(["client"]),
    async (req, res) => {
        try {
            const [result] = await db.query(
                "DELETE FROM projects WHERE id = ? AND client_id = ?",
                [req.params.id, req.user.userId]
            );
            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Project not found or you are not authorized to delete it.",
                    });
            }
            res.json({ message: "Project deleted successfully!" });
        } catch (error) {
            console.error("Error deleting project:", error);
            return res
                .status(500)
                .json({ error: "Error deleting project", details: error.message });
        }
    }
);

router.get(
    '/assigned-to-freelancer',
    authenticateToken,
    authorizeRole(["freelancer"]),
    projectController.getAssignedProjectsForFreelancer // <-- USE projectController here
);

module.exports = router;