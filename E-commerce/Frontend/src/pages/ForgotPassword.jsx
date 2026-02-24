import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg mb-4">
            <h1 className="text-3xl font-bold tracking-wider">ACCUNEX</h1>
          </div>
          <p className="text-slate-600 text-sm">Business Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          
          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 transition font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={18} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h3>
              <p className="text-slate-600 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-slate-500 text-xs">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          )}

          {/* Back to Login */}
          <button
            onClick={() => navigate("/login")}
            className="w-full mt-6 text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 Accunex. All rights reserved.
        </p>
      </div>
    </div>
  );
}
