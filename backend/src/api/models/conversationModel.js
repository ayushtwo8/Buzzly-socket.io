import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);

export default ConversationModel;