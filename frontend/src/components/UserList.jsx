import { Circle, User } from "lucide-react";

const UserList = ({ users, currentUser }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Online Users ({users.length})</span>
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser.id;
          
          return (
            <div 
              key={user.id} 
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isCurrentUser 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <Circle className="h-3 w-3 fill-green-400 text-green-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-medium truncate ${
                    isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {user.username}
                  </p>
                  {isCurrentUser && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isCurrentUser ? 'Online' : 'Active now'}
                </p>
              </div>
            </div>
          );
        })}
        
        {users.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No users online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;