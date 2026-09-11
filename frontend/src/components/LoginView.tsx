import React, { useState } from "react";
import { Trello, Mail, Lock, User as UserIcon, Shield, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { User, UserRole } from "../types";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
}

export default function LoginView({ onLoginSuccess, availableUsers }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(availableUsers.length === 0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("Teacher");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          role: role || "Teacher"
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Quick login failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error during login.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Dynamic Background Gradient Mesh */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-xl shadow-indigo-500/30 mb-2">
            <Trello className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Taskie<span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent font-normal">Tool</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Next-Gen Student Activity & Project Management Workspace
          </p>
        </div>

        {/* Authentication Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0f172a]/80 backdrop-blur-2xl border border-white/[0.1] shadow-2xl space-y-6">
          
          {/* Sign In vs Register Tabs */}
          <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.06] text-xs font-semibold">
            <button
              onClick={() => {
                setIsRegistering(false);
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                !isRegistering
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                isRegistering
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Professor Smith"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("Teacher")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      role === "Teacher"
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    Teacher / Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("Student")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      role === "Student"
                        ? "bg-emerald-600/20 border-emerald-500 text-white"
                        : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    Student
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? "Authenticating..." : isRegistering ? "Create Free Account" : "Access Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Quick Demo Sign-In Personas */}
        {availableUsers.length > 0 && (
          <div className="rounded-3xl p-5 bg-[#0f172a]/60 backdrop-blur-xl border border-white/[0.08] space-y-3 shadow-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Personas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.email)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/40 text-left transition cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: u.avatarColor || "#6366f1" }}
                  >
                    {getInitials(u.username)}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate">
                      {u.username}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {u.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
