import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth'

const App = () => {
  const {user, loading} = useAuth();

  if(loading){
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Buzzly...</p>
        </div>
      </div>
    );
  }

  return (
    
      <Routes>
        <Route path='/' element={user ? <Navigate to="/chat" replace /> : <Auth />} />
        <Route path='/chat' element={user ?  <Dashboard /> : <Navigate to="/" replace /> }/>
        <Route path='*' element={<Navigate to="/" replace /> }/>
      </Routes>
    
  )
};

export default App;