import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, Store, Shield, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function StaffRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const staffId = searchParams.get("staffId");

  const [formData, setFormData] = useState({
    name: "",
    email: email || "",
    role: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email || !staffId) {
      toast.error("Invalid invitation link");
      navigate("/login");
    } else {
      fetchStaffDetails();
    }
  }, [email, staffId, navigate]);

  const fetchStaffDetails = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/staff/${staffId}`);
      setFormData(prev => ({ ...prev, role: data.role }));
    } catch (error) {
      console.error("Error fetching staff details:", error);
    }
  };

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
      await axios.post("http://localhost:5000/api/staff/complete-registration", {
        staffId,
        name: formData.name,
        mobile: formData.mobile,
        password: formData.password,
      });
      toast.success("Registration completed! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Store className="text-teal-600" size={28} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-wider">ACCUNEX</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Welcome to<br />Your Team!
          </h2>
          <p className="text-teal-100 text-lg">
            Complete your registration to join your organization
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Bank-Grade Security</h3>
              <p className="text-teal-100 text-sm">Your data is encrypted and protected</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserPlus className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Quick Setup</h3>
              <p className="text-teal-100 text-sm">Just 2 minutes to complete registration</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Instant Access</h3>
              <p className="text-teal-100 text-sm">Start working immediately after setup</p>
            </div>
          </div>
        </div>

        <p className="text-teal-200 text-sm relative z-10">
          © 2024 Accunex. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-sm my-auto">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg mb-4">
              <Store size={24} />
              <h1 className="text-2xl font-bold tracking-wider">ACCUNEX</h1>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5">
          
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Complete Registration</h2>
              <p className="text-xs text-slate-500">Set up your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
            
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Email (Read-only - Locked) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  Email Address <Lock size={10} className="text-slate-400" />
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full pl-9 pr-8 py-2 text-sm border-2 border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-600 font-medium"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                </div>
              </div>

              {/* Role (Read-only - Locked) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  Role <Lock size={10} className="text-slate-400" />
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : ''}
                    readOnly
                    className="w-full pl-9 pr-8 py-2 text-sm border-2 border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed text-slate-600 font-medium"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition" size={16} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-10 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2.5 text-sm rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Completing Registration..." : "Complete Registration"}
              </button>
            </form>

            {/* Login Link */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500">Already registered?</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full border-2 border-teal-600 text-teal-600 py-2 text-sm rounded-lg hover:bg-teal-50 transition font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

