import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Files,
  Brain,
  HeartPulse,
  LogOut,
  LockKeyhole,
  UserRound,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import HealthRecords from "./pages/HealthRecords";
import AIInsights from "./pages/AIInsights";

import api, {
  saveAuthToken,
  getAuthToken,
  clearAuthToken,
} from "./services/api";

import "./App.css";

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("login/", {
        username: username.trim(),
        password,
      });

      const token = response.data?.token;

      if (!token) {
        throw new Error("Login token was not returned by the server.");
      }

      saveAuthToken(token);
      onLogin();
    } catch (err) {
      setError(
        err.message?.includes("401") ||
          err.message?.toLowerCase().includes("credentials")
          ? "Username or password is incorrect."
          : err.message || "Unable to log in. Check the backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hc-login-page">
      <div className="hc-login-glow hc-login-glow-one" />
      <div className="hc-login-glow hc-login-glow-two" />

      <section className="hc-login-card">
        <div className="hc-login-brand-icon">
          <HeartPulse size={30} />
        </div>

        <div className="hc-login-brand">HealthCopilot</div>
        <div className="hc-login-eyebrow">YOUR PERSONAL HEALTH SPACE</div>

        <h1>Welcome back.</h1>
        <p className="hc-login-description">
          One place to organize your health records and understand your
          medical documents.
        </p>

        <form onSubmit={handleSubmit} className="hc-login-form">
          <label htmlFor="hc-username">Username</label>
          <div className="hc-login-input-wrap">
            <UserRound size={18} />
            <input
              id="hc-username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <label htmlFor="hc-password">Password</label>
          <div className="hc-login-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="hc-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="hc-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className="hc-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="hc-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="hc-login-spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign in to your workspace
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="hc-login-security">
          <LockKeyhole size={15} />
          <span>Secure sign-in to your personal workspace</span>
        </div>

        <p className="hc-login-disclaimer">
          HealthCopilot provides informational document summaries, not
          medical diagnoses or treatment.
        </p>
      </section>
    </div>
  );
}

function AppLayout({ onLogout }) {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-brand-icon">
            <HeartPulse size={25} />
          </div>
          <div>
            <h2>HealthCopilot</h2>
            <p>Personal health space</p>
          </div>
        </div>

        <p className="app-menu-label">WORKSPACE</p>

        <nav className="app-navigation">
          <NavLink to="/dashboard" className="app-nav-link">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/records" className="app-nav-link">
            <Files size={19} />
            <span>Health Records</span>
          </NavLink>

          <NavLink to="/insights" className="app-nav-link">
            <Brain size={19} />
            <span>AI Health Insights</span>
          </NavLink>
        </nav>

        <div className="app-sidebar-footer">
          <HeartPulse size={18} />
          <span>Your health, organized.</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <span className="app-topbar-label">
              PERSONAL HEALTH COPILOT
            </span>
            <h3>Health Workspace</h3>
          </div>

          <div className="hc-header-actions">
            <div className="app-status">
              <span className="app-status-dot" />
              Health dashboard
            </div>

            <button
              type="button"
              className="hc-logout-button"
              onClick={onLogout}
              title="Sign out"
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="app-page-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/records" element={<HealthRecords />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(getAuthToken())
  );

  function handleLogin() {
    setAuthenticated(true);
  }

  function handleLogout() {
    clearAuthToken();
    setAuthenticated(false);
  }

  return authenticated ? (
    <AppLayout onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}