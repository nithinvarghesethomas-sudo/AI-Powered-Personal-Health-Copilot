import { Menu, UserRound, Bell, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Topbar.css";

const pageInfo = {
  "/": {
    title: "Health Dashboard",
    subtitle: "Your personal health overview",
  },
  "/upload": {
    title: "Upload Center",
    subtitle: "Add and organize your health documents",
  },
  "/records": {
    title: "Health Records",
    subtitle: "Access your saved medical information",
  },
  "/timeline": {
    title: "Health Timeline",
    subtitle: "Explore your health journey",
  },
  "/insights": {
    title: "Health Insights",
    subtitle: "Explore your health information",
  },
  "/profile": {
    title: "My Profile",
    subtitle: "Manage your personal health workspace",
  },
};

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = pageInfo[location.pathname] || pageInfo["/"];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-button"
          aria-label="Open navigation menu"
          aria-controls="app-sidebar"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        <div className="topbar-title">
          <h2>{currentPage.title}</h2>
          <p>{currentPage.subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Search health records"
          onClick={() => navigate("/records")}
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <Bell size={19} />
        </button>

        <button
          type="button"
          className="topbar-profile-button"
          aria-label="Open profile"
          onClick={() => navigate("/profile")}
        >
          <UserRound size={22} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}