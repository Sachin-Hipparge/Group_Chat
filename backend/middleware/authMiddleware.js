const jwt = require("jsonwebtoken");


const authenticateToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token required"
            });
        }


        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Store decoded user information in request
        req.user = decoded;


        next();

    } catch (error) {

        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};


module.exports = authenticateToken;