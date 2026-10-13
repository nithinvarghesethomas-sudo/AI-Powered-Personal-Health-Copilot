import { useState } from "react";
import {
  Bell,
  FileText,
  CalendarDays,
  ShieldCheck,
  CheckCheck,
  Trash2,
  ArrowRight,
  Inbox,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "document",
    title: "Health records workspace",
    message:
      "Your health documents can be organized in the Health Records section.",
    time: "Getting started",
    unread: true,
    icon: FileText,
  },
  {
    id: 2,
    type: "reminder",
    title: "Stay organized",
    message:
      "Keep your medical reports and prescriptions together for easier access.",
    time: "Helpful tip",
    unread: true,
    icon: CalendarDays,
  },
  {
    id: 3,
    type: "security",
    title: "Protect your health information",
    message:
      "Only upload medical documents to a trusted environment and avoid sharing sensitive information publicly.",
    time: "Privacy reminder",
    unread: false,
    icon: ShieldCheck,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter((item) => item.unread).length;

  const visibleNotifications = notifications.filter((item) => {
    if (filter === "unread") return item.unread;
    return true;
  });

  function markAllRead() {
    setNotifications((items) =>
      items.map((item) => ({ ...item, unread: false }))
    );
  }

  function markRead(id) {
    setNotifications((items) =>
      items.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <section className="notifications-page">
      <header className="notifications-heading">
        <div>
          <span className="notifications-eyebrow">
            YOUR HEALTH WORKSPACE
          </span>
          <h1>Notifications</h1>
          <p>
            Important reminders and helpful updates in one place.
          </p>
        </div>

        <div className="notifications-heading-icon">
          <Bell size={25} />
          {unreadCount > 0 && <span>{unreadCount}</span>}
        </div>
      </header>

      <section className="notifications-summary">
        <div className="notifications-summary-icon">
          <Inbox size={22} />
        </div>
        <div>
          <strong>
            {unreadCount === 0
              ? "You're all caught up"
              : `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`}
          </strong>
          <p>
            {notifications.length} notifications in your workspace
          </p>
        </div>
      </section>

      <section className="notifications-panel">
        <div className="notifications-toolbar">
          <div className="notifications-filters">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
          </div>

          <div className="notifications-actions">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} />
              <span>Mark all read</span>
            </button>

            <button
              type="button"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
              aria-label="Clear all notifications"
              title="Clear all notifications"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {visibleNotifications.length > 0 ? (
          <div className="notifications-list">
            {visibleNotifications.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.id}
                  className={`notification-item ${item.unread ? "unread" : ""}`}
                >
                  <div className={`notification-item-icon ${item.type}`}>
                    <Icon size={21} />
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <h3>{item.title}</h3>
                      {item.unread && (
                        <span className="notification-unread-dot" />
                      )}
                    </div>

                    <p>{item.message}</p>
                    <span className="notification-time">{item.time}</span>
                  </div>

                  <button
                    type="button"
                    className="notification-read-button"
                    onClick={() => markRead(item.id)}
                    disabled={!item.unread}
                    aria-label={`Mark ${item.title} as read`}
                    title="Mark as read"
                  >
                    <ArrowRight size={18} />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              <Bell size={27} />
            </div>
            <h3>
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p>
              {filter === "unread"
                ? "You've read all your current notifications."
                : "New updates will appear here when available."}
            </p>
            {filter === "unread" && notifications.length > 0 && (
              <button type="button" onClick={() => setFilter("all")}>
                View all notifications
              </button>
            )}
          </div>
        )}
      </section>

      <p className="notifications-disclaimer">
        These are in-app informational messages. Medical reminders and
        alerts are not yet connected to a live notification service.
      </p>
    </section>
  );
}