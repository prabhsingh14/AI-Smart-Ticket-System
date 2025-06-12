import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 
        if(!token){
            return res.status(401).json({
                success: false,
                message: "No token provided, authorization denied"
            });
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decodedToken._id).select("-password");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    
        req.user = user;
        next()
    } catch (error) {
        console.error("JWT verification error:", error);
        res.status(401).json({
            success: false,
            message: "Unauthorized access",
            error: error.message
        });
    }
}