import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    conversationId: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true});

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;