import UserModel from "../models/userModel.js";
import { comparePassword, generateToken, hashPassword} from "../../lib/utils.js"

export const register = async (req, res) => {
    try{
        const { email, password, username } = req.body;

        const existingUser = await UserModel.findOne({ $or: [{email}, {username}]});
        if(existingUser){
            return res.status(400).json({
                error: "User with this email or username already exists"
            })
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new UserModel.create({ email, username, password: hashedPassword});

        const token = generateToken(newUser._id);
        res.statusss(201).json({
            user: newUser,
            token
        })
    } catch(error){
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await UserModel.findOne({email}).select('+password');
        if(!user){
            return res.status(400).json({
                error: "Invalid credentials"
            })
        }

        const isValidPassword = await comparePassword(password, user.password);
        if(!isValidPassword){
            res.status(400).json({
                error: "Invalid credentials"
            })
        }

        const token = generateToken(user.id);
        res.json({
            user, 
            token
        })
    } catch(error){
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}