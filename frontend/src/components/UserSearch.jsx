import { useEffect, useState } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import axios from "axios";

const UserSearch = ({
  onSelectUser,
  onClose,
  currentUserId, // Removed as it was unused
  token,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Improvement #1: Debouncing the search input
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    // Set a timer to avoid API calls on every keystroke
    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500); // 500ms delay

    // Cleanup function to cancel the timer
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]); // Also add token as a dependency if it can change

  const searchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${backendUrl}/api/v1/user/search`, {
          params: { q: searchTerm, token: token }
        }
      );
      console.log("response: ", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]); // Clear results on error
    } finally {
      // Improvement #2: Use `finally` to guarantee setLoading(false) is called
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  // ... rest of your JSX remains the same, it is perfectly fine.
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Find Users</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.filter(user=> user._id !== currentUserId)
              .map((user) => (
                <div
                  key={user._id}
                  onClick={() => onSelectUser(user._id)}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.status}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Search for users to start chatting</p>
              <p className="text-sm mt-1">Enter a username to find people</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;