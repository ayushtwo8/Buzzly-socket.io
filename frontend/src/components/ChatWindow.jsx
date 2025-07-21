import { useEffect, useRef, useState } from "react";
import { Send, Circle} from 'lucide-react'

const ChatWindow = ({
  conversation,
  currentUser,
  socket,
  token,
  onConversationUpdate,
}) => {  

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchMessages();
    
    if (socket) {
      // Join conversation room
      socket.emit('join_conversation', conversation._id);
      console.log("socket: ", conversation);

      // Listen for new messages
      socket.on('new_message', (message) => {
        if (message.conversationId === conversation._id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      // Listen for typing indicators
      socket.on('user_typing', ({ user, isTyping }) => {
        setTypingUsers(prev => {
          if (isTyping) {
            return prev.find(u => u._id === user._id) ? prev : [...prev, user];
          } else {
            return prev.filter(u => u._id !== user._id);
          }
        });
      });

      // Listen for read receipts
      socket.on('messages_read', (conversationId) => {
        if (conversationId === conversation._id) {
          setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('messages_read');
      }
    };
  }, [socket, conversation._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/v1/conversations/${conversation._id}/messages?token=${token}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        if (socket) {
          socket.emit('mark_messages_read', {conversationId: conversation._id});
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || !socket) return;

    setLoading(true);
    
    socket.emit('send_message', {
      conversationId: conversation._id,
      content: newMessage.trim(),
      recipientId: conversation.otherUser._id
    });

    setNewMessage('');
    handleTypingStop();
    setLoading(false);
    onConversationUpdate();
  };

  const handleTypingStart = () => {
    if (socket) {
      socket.emit('typing_start', conversation._id);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 3000);
    }
  };

  const handleTypingStop = () => {
    if (socket) {
      socket.emit('typing_stop', conversation._id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (user) => {
    if (user.status === 'online') return 'Online';
    if (user.status === 'away') return 'Away';
    
    console.log("last seen user: ", user)
    try {
      const lastSeen = new Date(user.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `Last seen ${diffInMinutes}m ago`;
      } else if (diffInMinutes < 1440) {
        return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
      } else {
        return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
      }
    } catch {
      return 'Offline';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
              {conversation.otherUser.username.charAt(0).toUpperCase()}
            </div>
            <Circle className={`absolute -bottom-1 -right-1 h-4 w-4 fill-current ${getStatusColor(conversation.otherUser.status)}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.otherUser.username}
            </h2>
            <p className={`text-sm ${getStatusColor(conversation.otherUser.status)}`}>
              {getStatusText(conversation.otherUser)}
              {console.log("---------------",conversation.otherUser)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-blue-50/30">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUser._id;
          
          return (
            <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-3 max-w-xs sm:max-w-md lg:max-w-lg ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                    {isOwn 
                      ? currentUser.username.charAt(0).toUpperCase()
                      : conversation.otherUser.username.charAt(0).toUpperCase()
                    }
                  </div>
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                    isOwn 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                      : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200'
                  }`}>
                    <div className="text-sm leading-relaxed break-words">
                      {message.content}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                    {isOwn && (
                      <span className="ml-1">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 bg-white/50 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="italic">{conversation.otherUser.username} is typing...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={`Message ${conversation.otherUser.username}...`}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;