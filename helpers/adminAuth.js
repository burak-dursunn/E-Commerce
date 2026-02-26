const adminAuth = (req, res, next) => {
    // In express-jwt version 8+, the decoded token payload is attached to req.auth by default.
    // If you are using an older version, it might be attached to req.user.
    // Based on the project using express-jwt v8.5.1, we use req.auth.
    if (req.auth && req.auth.isAdmin) { //! req.auth?.isAdmin
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have the necessary permissions to access this resource.'
        });
    }
};

module.exports = adminAuth;
