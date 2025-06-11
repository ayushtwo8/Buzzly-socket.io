import jwt from 'jsonwebtoken';

import UserModel from '../models/userModel.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized - No token provided" });
            return;
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findById(decoded.userId).select("-password");
        
        req.user = user;
        next();
    } catch(error){
        res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}