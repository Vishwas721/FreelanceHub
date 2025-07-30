// backend/routes/users.js
const express = require("express");
const { authenticateToken, authorizeRole } = require("./authMiddleware");
const db = require("./db");

const router = express.Router();

const { body, validationResult } = require("express-validator");

router.get("/:id", authenticateToken, async (req, res) => {
    const userIdToFetch = parseInt(req.params.id, 10);
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    if (requestingUserId !== userIdToFetch && requestingUserRole !== 'admin') {
        return res.status(403).json({ error: "Forbidden: You are not authorized to view this profile." });
    }

    try {
        const [rows] = await db.query(
            `SELECT
                id, username, email, role, rating /* Only select existing columns */
            FROM users
            WHERE id = ?`,
            [userIdToFetch]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        const userData = rows[0];
        delete userData.password;

        res.json(userData);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

router.put(
    "/:id",
    authenticateToken,
    // No authorizeRole here, as both client/freelancer can edit their own profile
    [
        // Add validation rules for common fields
        body("username").optional().trim().escape().isLength({ min: 3 }).withMessage("Username must be at least 3 characters long."),
        body("email").optional().isEmail().withMessage("Invalid email address."),
        body("location").optional().trim().escape(),
        body("bio").optional().trim().escape(),

        // Role-specific validations (optional, but good practice)
        body("company_name").optional().trim().escape(),
        body("industry").optional().trim().escape(),
        body("contact_person").optional().trim().escape(),
        body("skills").optional().isJSON().withMessage("Skills must be a valid JSON array string."), // Frontend sends JSON string
        body("portfolio_link").optional().isURL().withMessage("Invalid portfolio link."),
        body("hourly_rate").optional().isFloat({ min: 0 }).withMessage("Hourly rate must be a positive number."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const userIdToUpdate = parseInt(req.params.id, 10);
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;

        // Authorization: User can only update their own profile
        if (requestingUserId !== userIdToUpdate) {
            // Or if you want admin to update, add: && requestingUserRole !== 'admin'
            return res.status(403).json({ error: "Forbidden: You are not authorized to update this profile." });
        }

        const {
            username, email, location, bio,
            company_name, industry, contact_person,
            skills, portfolio_link, hourly_rate
        } = req.body;

        try {
            // Build the update query dynamically to only update fields that are provided
            const updateFields = [];
            const updateValues = [];

            if (username !== undefined) { updateFields.push("username = ?"); updateValues.push(username); }
            if (email !== undefined) { updateFields.push("email = ?"); updateValues.push(email); }
            if (location !== undefined) { updateFields.push("location = ?"); updateValues.push(location); }
            if (bio !== undefined) { updateFields.push("bio = ?"); updateValues.push(bio); }

            // Client-specific fields
            if (requestingUserRole === 'client') {
                if (company_name !== undefined) { updateFields.push("company_name = ?"); updateValues.push(company_name); }
                if (industry !== undefined) { updateFields.push("industry = ?"); updateValues.push(industry); }
                if (contact_person !== undefined) { updateFields.push("contact_person = ?"); updateValues.push(contact_person); }
            }

            // Freelancer-specific fields
            if (requestingUserRole === 'freelancer') {
                if (skills !== undefined) { updateFields.push("skills = ?"); updateValues.push(skills); } // skills is already JSON string from frontend
                if (portfolio_link !== undefined) { updateFields.push("portfolio_link = ?"); updateValues.push(portfolio_link); }
                if (hourly_rate !== undefined) { updateFields.push("hourly_rate = ?"); updateValues.push(hourly_rate); }
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ message: "No fields provided for update." });
            }

            const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            updateValues.push(userIdToUpdate);

            const [result] = await db.query(query, updateValues);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "User not found or no changes made." });
            }

            res.status(200).json({ message: "Profile updated successfully!" });

        } catch (error) {
            console.error("Error updating user profile:", error);
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }
);

module.exports = router;