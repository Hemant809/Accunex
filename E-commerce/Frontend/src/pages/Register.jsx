import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, User, Mail, Lock, Phone, Eye, EyeOff, Sparkles, TrendingUp, Shield, Zap, CheckCircle, Home } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
      });
      toast.success("Registration successful!");
      navigate("/onboarding", { 
        state: { 
          shopId: res.data.shopId, 
          userId: res.data._id,
          email: formData.email,
          mobile: formData.mobile
        } 
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-40 -mb-40 animate-pulse delay-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Store className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">ACCUNEX</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start Your Business<br />Journey Today
          </h2>
          <p className="text-teal-100 text-lg">
            Join thousands of businesses managing their operations efficiently with Accunex
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          <Feature icon={TrendingUp} text="Real-time Sales & Inventory Tracking" />
          <Feature icon={Shield} text="Secure & Reliable Platform" />
          <Feature icon={Zap} text="Lightning Fast Performance" />
          <Feature icon={CheckCircle} text="24/7 Customer Support" />
        </div>

        <p className="relative z-10 text-teal-200 text-sm">
          © 2024 Accunex. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto relative">
        
        {/* Home Button */}
        <button
          onClick={() => window.location.href = 'http://localhost:5174'}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-teal-600 transition font-medium z-10"
        >
          <Home size={20} />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg mb-2">
              <Store size={24} />
              <h1 className="text-2xl font-bold">ACCUNEX</h1>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            
            {/* Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-3 shadow-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
              <p className="text-slate-500 text-sm">Get started with your free account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Email & Mobile in Grid */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mobile
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                    required
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-6"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-teal-600 hover:text-teal-700 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-slate-500 text-xs mt-6">
            © 2024 Accunex. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={20} />
      </div>
      <span className="text-teal-50">{text}</span>
    </div>
  );
}
