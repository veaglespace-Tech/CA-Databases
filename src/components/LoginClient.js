"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User, Shield, Database } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If already logged in, redirect away
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) router.replace(fromPath);
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, [fromPath, router]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.replace(fromPath === "/login" ? "/" : fromPath);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="login-page">
        <div className="login-loader">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #0a0e1a;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* animated gradient orbs */
        .login-page::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
          top: -150px; left: -150px;
          animation: drift1 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .login-page::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: drift2 14s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(60px,40px) scale(1.1); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-40px,-60px) scale(1.15); } }

        .login-loader {
          display: flex; align-items: center; justify-content: center; height: 100vh;
        }
        .spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          margin: 1rem;
          background: rgba(15,20,40,0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
          animation: slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* header */
        .login-header { text-align: center; margin-bottom: 2rem; }
        .login-logo {
          display: inline-flex;
          align-items: center; justify-content: center;
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 18px;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }
        .login-logo svg { color: white; width: 30px; height: 30px; }

        .login-title {
          font-size: 1.6rem; font-weight: 800;
          background: linear-gradient(135deg, #e0e7ff, #a5b4fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.4rem;
        }
        .login-subtitle {
          font-size: 0.85rem; color: rgba(255,255,255,0.45); font-weight: 400;
        }

        /* badge */
        .db-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em;
          color: #34d399; background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 20px; padding: 4px 10px;
          margin-top: 0.75rem;
        }
        .db-badge svg { width: 12px; height: 12px; }

        /* divider */
        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
          margin: 1.75rem 0;
        }

        /* form */
        .login-form { display: flex; flex-direction: column; gap: 1.1rem; }

        .form-group { display: flex; flex-direction: column; gap: 0.45rem; }
        .form-label {
          font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.65);
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .input-wrapper { position: relative; }
        .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(99,102,241,0.7); pointer-events: none;
          display: flex; align-items: center;
        }
        .input-icon svg { width: 16px; height: 16px; }

        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-size: 0.9rem; color: #e2e8f0; font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .form-input::placeholder { color: rgba(255,255,255,0.25); }
        .form-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .form-input.has-toggle { padding-right: 3rem; }

        .toggle-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); padding: 4px;
          border-radius: 6px; transition: color 0.2s;
          display: flex; align-items: center;
        }
        .toggle-btn:hover { color: rgba(255,255,255,0.8); }
        .toggle-btn svg { width: 16px; height: 16px; }

        /* error */
        .form-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 0.65rem 1rem;
          font-size: 0.82rem; color: #f87171; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        /* submit button */
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          border: none; border-radius: 12px;
          padding: 0.85rem;
          font-size: 0.95rem; font-weight: 700; color: white;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
          margin-top: 0.4rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(99,102,241,0.5);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .login-btn .btn-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* footer hint */
        .login-hint {
          text-align: center;
          font-size: 0.75rem; color: rgba(255,255,255,0.25);
          margin-top: 1.5rem;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .login-hint svg { width: 13px; height: 13px; opacity: 0.6; }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <Shield />
            </div>
            <h1 className="login-title">CEO CaLeads</h1>
            <p className="login-subtitle">Management Dashboard</p>
            <span className="db-badge">
              <Database />
              CEO_CaLeads Database
            </span>
          </div>

          <div className="login-divider" />

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><User /></span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock /></span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  className="form-input has-toggle"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="form-error" role="alert">
                <Lock size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <><div className="btn-spinner" /> Signing in…</>
              ) : (
                <><Shield size={16} /> Sign In</>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="login-hint">
            <Lock />
            Secured with JWT authentication
          </p>
        </div>
      </div>
    </>
  );
}
