import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
    const { email, password, skills = [] } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            skills,
        });

        // Fire Inngest event
        try {
            await inngest.send({
                name: "user/signup",
                data: {
                    email: user.email,
                    userId: user._id,
                },
            });
        } catch (error) {
            console.error("Error sending Inngest event:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send signup event",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Respond
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                skills: user.skills,
            },
            token,
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = jwt.sign({
            _id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                skills: user.skills,
            },
            token
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                refreshToken: undefined
            },
        },{ new: true })
    
        const options = {
            httpOnly: true,
            secure: true
        }

        res.cookie("token", "", options);
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const updateUser = async (req, res) => {
    const { skills = [], role, email } = req.body;

    try {
        if(req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this user"
            });
        }

        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: {
                skills: skills.length > 0 ? skills : user.skills,
                role,
                email
            }
        }, { new: true });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                skills: user.skills,
            }
        });
    } catch (error) {
        console.error("Error during user update:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getUser = async (req, res) => {
    try {
        if(req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this user"
            });
        }

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}