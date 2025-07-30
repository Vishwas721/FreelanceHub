const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.log("AuthenticateToken - No token provided");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            console.error("AuthenticateToken - JWT Verification Error:", err);
            // Common errors: TokenExpiredError, JsonWebTokenError (for invalid signature)
            return res.status(403).json({ error: "Invalid or expired token" }); // 403 Forbidden for invalid token
        }

        req.user = decodedUser;
        console.log("AuthenticateToken - Token verified. Decoded user:", req.user); // Added this log for more detail
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        console.log("IsAdmin - User Role:", req.user ? req.user.role : 'undefined');
        return res.status(403).json({ error: "Admin access only!" });
    }
    next();
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            console.log(`AuthorizeRole - Forbidden Access for role: ${req.user ? req.user.role : 'undefined'}. Required roles: ${roles.join(', ')}`);
            return res.status(403).json({ error: "Forbidden - Insufficient role" });
        }
        next();
    };
};

module.exports = { authenticateToken, isAdmin, authorizeRole };