import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes 
export const protectRoute = async (req, res, next)=>{
    try {
        // Prefer cookie token, then headers
        let token = req.cookies?.token || null;
        if (!token) {
            const authHeader = req.headers.authorization || req.headers['authorization'];
            const tokenHeader = req.headers.token || req.headers['token'];
            if (tokenHeader) token = tokenHeader;
            else if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.status(404).json({ success: false, message: "User not found" });

        req.user = user;
        return next();
    } catch (error) {
        console.log(error.message);
        // Token verification errors should return 401
        return res.status(401).json({ success: false, message: error.message });
    }
}