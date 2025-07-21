import { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log("nessagelist", messages);

  const isSystemMessage = (message) => {
    return message.user.username === "System";
  };

  const isOwnMessage = (message) => {
    return message.user.id === currentUser.id;
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-blue-50/30">
      {messages.map((message) => {
        if (isSystemMessage(message)) {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="bg-gray-100/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-full text-sm">
                {message.text}
              </div>
            </div>
          );
        }

        const isOwn = isOwnMessage(message);

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex space-x-3 max-w-xs sm:max-w-md lg:max-w-lg ${
                isOwn ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                  {message.user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-xl px-4 py-2 shadow-sm ${
                    isOwn
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      : "bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200"
                  }`}
                >
                  {!isOwn && (
                    <div className="text-xs font-medium text-blue-600 mb-1">
                      {message.user.username}
                    </div>
                  )}
                  <div className="text-sm leading-relaxed break-words">
                    {message.text}
                  </div>
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isOwn ? "text-right" : "text-left"
                  }`}
                >
                  {console.log(message.timestamp)}
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
