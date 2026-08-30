"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { token, login } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      const { user } = useAuthStore.getState();
      router.replace(user?.role === "admin" ? "/admin" : "/chat");
    }
  }, [token, router]);

  const validateForm = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
      // Auto login after register
      const { data } = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data.user, data.token);
      router.push(data.user.role === "admin" ? "/admin" : "/chat");
    } catch (err: any) {
      console.error("Registration error:", err);
      const serverMsg = err.response?.data?.message;
      const netMsg = err.message;
      setError(serverMsg || netMsg || "Registration failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "#ef4444", width: "25%" };
    if (p.length < 8) return { label: "Weak", color: "#f59e0b", width: "50%" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Strong", color: "#10b981", width: "100%" };
    return { label: "Good", color: "#6366f1", width: "75%" };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0" style={{ background: "var(--background)" }} />
      <div className="absolute top-20 right-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: "var(--primary)" }} />
      <div className="absolute bottom-10 left-1/4 w-56 h-56 rounded-full opacity-8 blur-3xl" style={{ background: "var(--accent)" }} />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
              <Brain size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">CollegeAI</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Join CollegeAI and start getting instant answers</p>
        </div>

        <div className="card" style={{ borderRadius: "1rem" }}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
                <CheckCircle size={16} /> Account created! Redirecting...
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  id="reg-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  placeholder="your@college.edu"
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="reg-role" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Account Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                id="reg-role"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="input"
                style={{ cursor: "pointer" }}
              >
                <option value="student">🎓 Student</option>
                <option value="admin">🛡️ Administrator</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className="input pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="h-1 rounded-full" style={{ background: "var(--surface-2)" }}>
                    <div className="h-1 rounded-full transition-all duration-300" style={{ width: passwordStrength.width, background: passwordStrength.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>{passwordStrength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Confirm Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className="input pl-9 pr-10"
                  style={form.confirmPassword && form.confirmPassword !== form.password ? { borderColor: "#ef4444" } : {}}
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="reg-submit"
              disabled={loading || success}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                : success
                ? <><CheckCircle size={16} /> Account Created!</>
                : "Create Account"
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--primary)" }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
