import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { MessageCircle, Users, Shield, Zap, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [view, setView] = useState("sign_in");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setloading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();

  console.log("auth component");
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setloading(true);

    try{
      if(view === 'sign_up'){
        if(formData.password !== formData.confirmPassword){
          setError('Password do not match');
          return;
        }
        if(formData.password.length < 6){
          setError('Password must be atleast 6 characters');
          return;
        }

        const result = await register(formData.email, formData.password, formData.username);
        if(!result.success){
          setError(result.error || 'Registration failed');
        }
      } else{
        const result = await login(formData.email, formData.password);
        if(!result.success) {
          setError(result.error || 'Login failed');
        }
      } 
    }catch(error){
        setError('An unexpected error occured');
      } finally {
        setloading(false);
      }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 mb-6">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Welcome to Buzzly
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Connect with friends through secure, private conversations
          </p>

          {/* features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <span>Secure authentication and private messaging</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <span>One-on-one conversations with friends</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <span>Real-time messaging with instant delivery</span>
            </div>
          </div>
        </div>

        {/* auth form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="mb-6">
            <div className="flex space-x-l bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setView("sign_in");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  view === "sign_in"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setView("sign_up");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  view === "sign_up"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {view === "sign_up" && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Choose a username"
                  required
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {view === "sign_up" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading
                ? "Please wait..."
                : view === "sign_in"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;