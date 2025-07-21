import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import UserModel from '../api/models/userModel.js';
import MessageModel from '../api/models/messageModel.js';
import ConversationModel from '../api/models/conversationModel.js';
import { getConversationId } from '../lib/utils.js';

export const userSockets = new Map(); // userId -> socketId
export const socketUsers = new Map(); // socketId -> userId

export const initializeSocket = (server) => {
    const allowedOrigins = process.env.FRONTEND_URLS.split(',');
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected: ', socket.id);

        // authentication and user status
        socket.on('authenticate', async (token) => {
            try{
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if(decoded){
                    const userId = decoded.userId;
                    console.log("userid: ",userId)
                    socketUsers.set(socket.id, {_id: userId, username: user.username});
                    userSockets.set(userId, socket.id);

                    await UserModel.findByIdAndUpdate(userId, {status: 'online'});
                    socket.broadcast.emit('user_status_change', { userId, status: "online"});
                    console.log(`User ${userId} authenticated and set to online.`);
                }
            } catch(error){
                console.error("Socket authentication error: ", error);
            }
        })

        socket.on('disconnect', async() => {
            const userId = socketUsers.get(socket.id);
            if(userId){
                await UserModel.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
                socket.broadcast.emit('user_status_change', { userId, status : 'offline'})

                socketUsers.delete(socket.id);
                userSockets.delete(userId);

                console.log(`User ${userId} disconnected and set to offline`);
                
            }
            console.log('User disconnected: ', socket.id);
            
        })

        // messaging
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined room ${conversationId}`);
            
        })

        socket.on('send_message', async(data) => {
            try{
                const { conversationId, content, recipientId } = data;
                const senderId = socketUsers.get(socket.id);
                if(!senderId){
                    return;
                }

                // create and save new message
                const newMessage = new MessageModel({
                    conversationId,
                    senderId,
                    content
                });
                await newMessage.save();

                // update conversation's last message and timestamp
                await ConversationModel.findByIdAndUpdate(conversationId, {
                    lastMessage: newMessage._id
                })

                const populateMessage = await MessageModel.findById(newMessage._id).populate('senderId');

                // emit to all members  of the conversation room
                io.to(conversationId).emit('new_message', populateMessage);
            } catch(error){
                console.error("Error sending message: ", error);
            }
        });

        // conversation creation
        socket.on('start_conversation', async(data) => {
            try{
                const senderId = socketUsers.get(socket.id);
                if(!senderId ) return;

                console.log("data: ",data);

                const recipientId = data.recipientId;
                const conversationId = getConversationId(senderId, recipientId);

                let conversation = await ConversationModel.findById(conversationId).populate('participants');

                if(!conversation){
                    conversation = new ConversationModel({
                        _id: conversationId,
                        participants: [senderId, recipientId]
                    })

                    await conversation.save();

                    conversation = await ConversationModel.findById(conversationId).populate('participants');
                }

                const otherUser = conversation.participants.find(p => p._id.toString() !== senderId.toString());

                socket.emit('conversation_created', {
                    ...conversation.toObject(),
                    otherUser
                })
            } catch(error){
                console.error('Error starting conversation: ', error)
            }
        })

        // typing indicators
        socket.on('typing_start', ({conversationId}) => {

            const userData = socketUsers.get(socket.id);
            if(userData){
        socket.to(conversationId).emit('user_typing', { user: userData, isTyping: true });
            }
        })

        socket.on('typing_stop', ({ conversationId })=>{
            const userData = socketUsers.get(socket.id);
            if(userData) {
                socket.to(conversationId).emit('user_typing', {user:userData, isTyping: false});
            }
        })

        // read receipts
        socket.on('mark_messages_read', async({conversationId}) => {
            try{
                const userId = socketUsers.get(socket.id);
                if(!userId) return;

                await MessageModel.updateMany(
                    { conversationId: conversationId, senderId: { $ne: userId}, isRead: false},
                    { $set: { isRead: true}}
                );

                io.to(conversationId).emit('messages_read', {conversationId, readerId: userId});
            } catch(error){
                console.error("Error marking messages as read: ", error);
            }
        })
    })

    return io;
}
