const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectedConversation,
  currentUserId,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  console.log("conversation: ", conversations);

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    const isOwn = message.senderId === currentUserId;
    const prefix = isOwn ? 'You: ' : '';
    const content = message.content.length > 30 
      ? message.content.substring(0, 30) + '...' 
      : message.content;
    
    return prefix + content;
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return '';
    }
  };

  // console.log("otherUser: ", otherUser)

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a new conversation to get started</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => onSelectedConversation(conversation)}
          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedConversation?._id === conversation._id
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                {/* {conversation.otherUser.charAt(0).toUpperCase()} */}
              </div>
              {/* <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(conversation.otherUser.status)}`} /> */}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.otherUser.username}
                </h4>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {formatLastMessage(conversation.lastMessage)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;