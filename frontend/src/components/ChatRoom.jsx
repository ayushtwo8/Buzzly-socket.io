import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const ChatRoom = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("user_join", currentUser);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("message_history", (history) => {
      setMessages(history);
    });

    newSocket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("users_update", (users) => {
      setConnectedUsers(users);
    });

    newSocket.on("user_joined", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `${user.username} joined the chat`,
          user: { ...user, username: "System" },
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    newSocket.on("user_left", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `${user.username} left the chat`,
          user: { ...user, username: "System" },
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    newSocket.on("user_typing", ({ user, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.find((u) => u.id === user.id) ? prev : [...prev, user];
        } else {
          return prev.filter((u) => u.id !== user.id);
        }
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit("send_message", { text: newMessage });
      setNewMessage("");
      handleTypingStop();
    }
  };

  const handleTypingStart = () => {
    if (socket) {
      socket.emit("typing_start");

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
      socket.emit("typing_stop");
    }
    if (typingTimeoutRef.current) {
      clearInterval(typingTimeoutRef.current);
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* user list sidebar */}
      <div
        className={`bg-white/80 backdrop-blur-sm border-r border-gray-200 transition-all duration-300 ${
          showUserList ? "w-80" : "w-0 overflow-hidden"
        } lg:w-80 bg-block`}
      >
        <UserList users={connectedUsers} currentUser={currentUser} />
      </div>

      {/* main chat area */}
      <div className="flex-1 flex flex-col">
        {/* header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-color"
            >
              <Users className="h-5 w-5" />
            </button>
            <div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Buzzly
                </h1>
                <p className="text-sm text-gray-500">Real-time chat platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                {connectedUsers.length} online
              </div>
            </div>
          </div>

          {/* message area */}
          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} currentUser={currentUser} />
          </div>

          {/* typing indicator */}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

          {/* Message Input */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                ref={messageInputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
