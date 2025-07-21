import ConversationModel from "../models/conversationModel.js";
import MessageModel from "../models/messageModel.js";

export const getUserConversations = async(req, res) => {
    console.log('getUserConversation controller');
    try{
        const userId = req.user._id;
        const conversations = await ConversationModel.find({
            participants: userId
        }).populate({
            path: 'lastMessage',
            populate: ({path: 'senderId', select: 'username status lastSeen'})
        })
        .populate({
            path: 'participants',
            select: 'username status lastSeen'
        })
        .sort({ updatedAt: -1});

       

        const formattedConversations = conversations.map(conv => {
            const otherUser = conv.participants.find(p=> p._id.toString() !== userId.toString())
            return {
                ...conv.toObject(),
                otherUser
            }
        })
        console.log('formattedConvsersation:', formattedConversations)
        res.json(formattedConversations);
    } catch(error){
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const getMessages = async (req, res) => {

    console.log('getMessages controller');
    try{
        const { conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            participants: userId
        })


        if(!conversation){
            return res.status(403).json({
                error: "Access denied"
            })
        }

        const messages = await MessageModel.find({ conversationId }).populate('senderId');
        res.json(messages);
    } catch(error){
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}