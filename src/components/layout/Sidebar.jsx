
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileUp,
  Files,
  GitBranch,
  Brain,
  UserRound,
  HeartPulse,
  ShieldCheck,
  X,
  ChevronRight,
} from "lucide-react";

import "../../styles/components.css";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Upload Center",
    path: "/upload",
    icon: FileUp,
  },
  {
    label: "Health Records",
    path: "/records",
    icon: Files,
  },
  {
    label: "Health Timeline",
    path: "/timeline",
    icon: GitBranch,
  },
  {
    label: "Health Insights",
    path: "/insights",
    icon: Brain,
    ai: true,
  },
];

function Sidebar({ open = false, onClose = () => {} }) {
  const handleNavigation = () => {
    onClose();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={onClose}
          tabIndex={-1}
        />
      )}

      <aside
        id="app-sidebar"
        className={`sidebar${open ? " sidebar-open" : ""}`}
        aria-label="Application sidebar"
        aria-hidden={!open && typeof window !== "undefined"
          ? window.innerWidth <= 900
          : undefined}
      >
        <div className="brand">
          <NavLink
            to="/"
            className="brand-home"
            aria-label="HealthCopilot home"
            onClick={handleNavigation}
          >
            <span className="brand-mark">
              <HeartPulse size={25} strokeWidth={2.2} />
            </span>

            <span className="brand-copy">
              <span className="brand-name">HealthCopilot</span>
              <span className="brand-caption">
                YOUR HEALTH, SIMPLIFIED
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            className="sidebar-close"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ label, path, icon: Icon, end, ai }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link-active" : ""}`
              }
            >
              <Icon
                size={19}
                strokeWidth={1.9}
                aria-hidden="true"
              />

              <span className="nav-link-label">{label}</span>

              {ai && (
                <span className="ai-tag" aria-label="AI powered">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <section className="privacy-card" aria-labelledby="privacy-title">
            <div className="privacy-icon">
              <ShieldCheck size={19} strokeWidth={2} />
            </div>

            <strong id="privacy-title">Your privacy matters</strong>

            <p>
              Your health information deserves care. Review how your data is
              handled before sharing personal medical documents.
            </p>
          </section>

          <NavLink
            to="/profile"
            onClick={handleNavigation}
            className={({ isActive }) =>
              `profile-link${isActive ? " nav-link-active" : ""}`
            }
          >
            <span className="avatar">
              <UserRound size={19} strokeWidth={1.9} />
            </span>

            <span className="profile-info">
              <strong>My Profile</strong>
              <span>Personal health space</span>
            </span>

            <ChevronRight
              className="profile-chevron"
              size={17}
              aria-hidden="true"
            />
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
