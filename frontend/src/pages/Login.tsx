import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Briefcase, Lock, Mail, AlertCircle, Loader } from "lucide-react";
import { toast } from "react-hot-toast";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      setError(err?.message || "Login failed. Please check your credentials.");
      toast.error(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Demo credential helper
  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-400 items-center justify-center shadow-xl shadow-primary-500/20 mb-4 animate-bounce">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to ElevateHR
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Enter credentials to access the management portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-card border border-dark-border p-8 rounded-3xl shadow-2xl relative backdrop-blur-md">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-primary-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick-fill Shortcuts */}
          <div className="mt-8 pt-6 border-t border-dark-border">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
              Demo Roles Quick-Fill
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("hr@company.com")}
                className="px-2 py-2 text-xs font-semibold rounded-lg bg-slate-800/60 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-dark-border cursor-pointer transition-colors"
              >
                HR Lead
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("manager@company.com")}
                className="px-2 py-2 text-xs font-semibold rounded-lg bg-slate-800/60 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-dark-border cursor-pointer transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("employee@company.com")}
                className="px-2 py-2 text-xs font-semibold rounded-lg bg-slate-800/60 hover:bg-slate-800 text-primary-400 hover:text-primary-300 border border-dark-border cursor-pointer transition-colors"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
