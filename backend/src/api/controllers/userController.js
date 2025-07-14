import UserModel from "../models/userModel.js";

export const searchUsers = async (req, res) => {
    try{
        const { q } = req.query;
        const currentUserId = req.user._id;

        if(!q){
            return res.json([]);
        }

        const users =  await UserModel.find({
            username: { $regex: q, $options: 'i'},
            _id: { $ne : currentUserId }
        }).limit(10);

        res.json(users);
    } catch(error){
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}