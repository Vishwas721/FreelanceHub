// backend/deliverableRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authorizeRole } = require('./authMiddleware'); // authenticateToken is global, keep authorizeRole
const db = require('./db');

const router = express.Router();

// Define the base upload directory: backend/uploads
const baseUploadDir = path.join(__dirname, 'uploads');

// Ensure the base upload directory exists when this module is loaded
if (!fs.existsSync(baseUploadDir)) {
    try {
        fs.mkdirSync(baseUploadDir, { recursive: true });
        console.log(`[DeliverableRoutes.js] Created base upload directory: ${baseUploadDir}`);
    } catch (err) {
        console.error(`[DeliverableRoutes.js] ERROR creating base upload directory at startup:`, err);
        // If this fails, it's a critical error, probably permissions.
        // It's good to know early. You might even want to throw err here to halt the server.
    }
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`[Multer Destination TEST] Attempting to save directly to baseUploadDir: ${baseUploadDir}`);
        cb(null, baseUploadDir); // <-- CRITICAL CHANGE: Always save to the root 'uploads'
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const newFilename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        console.log(`[Multer Filename TEST] Generated filename: ${newFilename}`);
        cb(null, newFilename);
    },
});

// Initialize Multer upload middleware

const uploadMiddleware = multer({
    storage: storage,
    // Explicitly set the temporary destination to your baseUploadDir
    // This might help if system temp directory has issues
    dest: baseUploadDir
}).single('deliverableFile');

// Freelancer uploads a deliverable
router.post(
    '/upload/:projectId',
    authorizeRole(['freelancer']),
    (req, res, next) => {
        console.log(`[DeliverableRoutes.js] POST /upload/:projectId hit. Multer starting...`);
        // Use the configured upload middleware with explicit error handling
        uploadMiddleware(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.error(`[DeliverableRoutes.js] MulterError:`, err.message);
                return res.status(500).json({ error: err.message });
            } else if (err) {
                console.error(`[DeliverableRoutes.js] Unknown Multer upload error:`, err);
                return res.status(500).json({ error: "An unknown error occurred during file upload." });
            }
            console.log(`[DeliverableRoutes.js] Multer processed file. Continuing to route handler.`);
            next(); // Continue to the next middleware/route handler
        });
    },
    async (req, res) => {
        console.log(`[DeliverableRoutes.js] Inside async route handler. req.file:`, req.file);
        console.log(`[DeliverableRoutes.js] Req.body:`, req.body);

        try {
            const { projectId } = req.params;
            const freelancerId = req.user.userId;
            const { description } = req.body;
            const file = req.file;

            if (!file) {
                console.log("[DeliverableRoutes.js] No file provided in req.file after Multer processing.");
                return res.status(400).json({ error: "No file uploaded" });
            }

            console.log(`[DeliverableRoutes.js] File received:`, file);
            console.log(`[DeliverableRoutes.js] Description received:`, description);

            // Verify that the freelancer is assigned to this project
            const [projectRows] = await db.query(
                "SELECT assigned_freelancer_id, project_status FROM projects WHERE id = ?",
                [projectId]
            );

            if (projectRows.length === 0) {
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log(`[DeliverableRoutes.js] Deleted file due to project not found: ${file.path}`);
                }
                return res.status(404).json({ error: "Project not found" });
            }

            const project = projectRows[0];

            if (project.assigned_freelancer_id !== freelancerId) {
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log(`[DeliverableRoutes.js] Deleted file due to unauthorized access: ${file.path}`);
                }
                return res.status(403).json({ error: "Unauthorized: You are not assigned to this project" });
            }

            // Insert deliverable into database
            await db.query(
                "INSERT INTO deliverables (project_id, freelancer_id, file_path, file_name, description) VALUES (?, ?, ?, ?, ?)",
                [projectId, freelancerId, file.path, file.originalname, description]
            );
            console.log(`[DeliverableRoutes.js] Deliverable record inserted into DB for project ${projectId}.`);

            // OPTIONAL: Update project status
            if (project.project_status === 'assigned' || project.project_status === 'in_progress') {
                await db.query("UPDATE projects SET project_status = 'completed_pending_review' WHERE id = ?", [projectId]);
                console.log(`[DeliverableRoutes.js] Project ${projectId} status updated to 'completed_pending_review'.`);
            }

            res.status(201).json({ message: "Deliverable uploaded successfully!", filePath: file.path });

        } catch (error) {
            console.error(`[DeliverableRoutes.js] ERROR in deliverable upload route handler:`, error);
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log(`[DeliverableRoutes.js] Deleted file due to handler error: ${req.file.path}`);
            }
            res.status(500).json({ error: "Failed to upload deliverable", details: error.message });
        }
    }
);
// Client/Freelancer gets deliverables for a project
router.get('/:projectId', async (req, res) => { // Removed authenticateToken - it's global
    try {
        const { projectId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const [project] = await db.query("SELECT client_id, assigned_freelancer_id FROM projects WHERE id = ?", [projectId]);

        if (project.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (userRole === 'client' && project[0].client_id !== userId) {
            return res.status(403).json({ error: "Unauthorized: You are not the client of this project" });
        }
        if (userRole === 'freelancer' && project[0].assigned_freelancer_id !== userId) {
            return res.status(403).json({ error: "Unauthorized: You are not the assigned freelancer for this project" });
        }

        const [deliverables] = await db.query(
            "SELECT id, project_id, freelancer_id, file_name, upload_date, description FROM deliverables WHERE project_id = ?",
            [projectId]
        );
        res.json(deliverables);

    } catch (error) {
        console.error("Error fetching deliverables:", error);
        res.status(500).json({ error: "Failed to fetch deliverables", details: error.message });
    }
});

// Route to download a specific deliverable
router.get('/download/:deliverableId', async (req, res) => { // Removed authenticateToken - it's global
    try {
        const { deliverableId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const [deliverable] = await db.query("SELECT file_path, project_id FROM deliverables WHERE id = ?", [deliverableId]);
        if (deliverable.length === 0) {
            return res.status(404).json({ error: "Deliverable not found" });
        }

        const filePath = deliverable[0].file_path;
        const projectId = deliverable[0].project_id;

        // Authorize download: Client or assigned freelancer
        const [project] = await db.query("SELECT client_id, assigned_freelancer_id FROM projects WHERE id = ?", [projectId]);
        if (project.length === 0 || (userRole === 'client' && project[0].client_id !== userId) || (userRole === 'freelancer' && project[0].assigned_freelancer_id !== userId)) {
            return res.status(403).json({ error: "Unauthorized to download this deliverable" });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found on server" });
        }

        // Use path.basename to get just the filename from the full path for res.download
        // This ensures the downloaded file has a clean name, not the full server path.
        const originalFileName = path.basename(filePath);
        res.download(filePath, originalFileName);

    } catch (error) {
        console.error("Error downloading deliverable:", error);
        res.status(500).json({ error: "Failed to download deliverable", details: error.message });
    }
});

module.exports = router;