import jwt from 'jsonwebtoken' 
import UserModel from '../models/userModel.js';

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.query.token || req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({
                error: 'Unauthorized - No token provided'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({
                error: "Unathorized - Invalid token"
            })
        }

        const user = await UserModel.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(404).json({
                error: "User not found"
            })
        }

        req.user = user;
        next();
    } catch(error){
        console.error("protectRoute error: ", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}