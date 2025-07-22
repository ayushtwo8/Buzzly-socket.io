// src/components/Dashboard.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";
import { LogOut, Plus, ArrowLeft } from "lucide-react"; // Note: ArrowLeft is not used here but in ChatWindow
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import UserSearch from "./UserSearch";

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user && token) {
      const newSocket = io(backendUrl);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        newSocket.emit("authenticate", token);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
      });

      newSocket.on("conversation_created", (conversation) => {
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversation(conversation);
        setShowUserSearch(false);
      });

      newSocket.on("new_message", () => {
        fetchConversations();
      });

      fetchConversations();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${backendUrl}/api/v1/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to fetch conversations: ", error);
    }
  };

  const handleNewConversation = (otherUserId) => {
    if (!socket || !user) return;
    socket.emit("start_conversation", { recipientId: otherUserId });
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar - Conditionally hidden on mobile */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Buzzly
            </h1>
            <div className="flex items-center space-x-2"> {/* Corrected space-x-2 */}
              <button
                onClick={() => setShowUserSearch(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Start new conversation"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Current user */}
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {user.username}
              </p>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <p className="text-xs text-gray-600">
                  {isConnected ? "Online" : "Connecting..."}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectedConversation={setSelectedConversation}
            currentUserId={user._id}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUser={user}
            socket={socket}
            token={token}
            onConversationUpdate={fetchConversations}
            // Pass a function to go back to the conversation list on mobile
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          // This welcome screen is only visible on desktop now, because on mobile,
          // the sidebar takes up the full screen when no conversation is selected.
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-100/50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 mb-4">
                Select a conversation or start a new one to begin messaging
              </p>
              <button
                onClick={() => setShowUserSearch(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Find Users
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onSelectUser={handleNewConversation}
          onClose={() => setShowUserSearch(false)}
          currentUserId={user._id}
          token={token}
        />
      )}
    </div>
  );
};

export default Dashboard;