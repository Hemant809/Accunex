import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, TrendingUp, BarChart3, Package, Users, Home } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <TrendingUp className="text-teal-600" size={28} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-wider">ACCUNEX</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Manage Your Business<br />Like Never Before
          </h2>
          <p className="text-teal-100 text-lg">
            Complete business management solution for modern enterprises
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Real-time Analytics</h3>
              <p className="text-teal-100 text-sm">Track sales, inventory, and profits instantly</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Inventory Management</h3>
              <p className="text-teal-100 text-sm">Never run out of stock with smart alerts</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Team Collaboration</h3>
              <p className="text-teal-100 text-sm">Manage staff with role-based access</p>
            </div>
          </div>
        </div>

        <p className="text-teal-200 text-sm relative z-10">
          © 2024 Accunex. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
        
        {/* Home Button */}
        <button
          onClick={() => window.location.href = 'http://localhost:5174'}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-teal-600 transition font-medium"
        >
          <Home size={20} />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg mb-4">
              <TrendingUp size={24} />
              <h1 className="text-2xl font-bold tracking-wider">ACCUNEX</h1>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back!</h2>
              <p className="text-slate-500">Sign in to continue to your dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">New to Accunex?</span>
              </div>
            </div>

            {/* Register Link */}
            <button
              onClick={() => navigate("/register")}
              className="w-full border-2 border-teal-600 text-teal-600 py-3.5 rounded-xl hover:bg-teal-50 transition font-semibold flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={20} />
              Create New Account
            </button>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              🔒 Secure & Encrypted | Trusted by 1000+ businesses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
