
import { useEffect, useState } from "react";
import {
  Files,
  FileText,
  ClipboardCheck,
  Activity,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  Brain,
  Upload,
  CalendarDays,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../services/dashboardService";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error("Dashboard API error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Dashboard data load aagala. Backend connection check pannunga."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalRecords = Number(summary?.total_records ?? 0);
  const labReports = Number(summary?.lab_reports ?? 0);
  const prescriptions = Number(summary?.prescriptions ?? 0);
  const healthUpdates = Number(summary?.health_updates ?? 0);

  const stats = [
    {
      title: "Total Records",
      value: totalRecords,
      icon: Files,
      color: "teal",
      description: "All stored documents",
    },
    {
      title: "Lab Reports",
      value: labReports,
      icon: FileText,
      color: "blue",
      description: "Laboratory documents",
    },
    {
      title: "Prescriptions",
      value: prescriptions,
      icon: ClipboardCheck,
      color: "purple",
      description: "Prescription records",
    },
    {
      title: "Health Updates",
      value: healthUpdates,
      icon: Activity,
      color: "orange",
      description: "Other health records",
    },
  ];

  const recentRecords = Array.isArray(summary?.recent_records)
    ? summary.recent_records
    : [];

  const distribution = [
    {
      label: "Lab reports",
      value: labReports,
      color: "lab",
    },
    {
      label: "Prescriptions",
      value: prescriptions,
      color: "prescription",
    },
    {
      label: "Other records",
      value: Math.max(
        totalRecords - labReports - prescriptions,
        0
      ),
      color: "other",
    },
  ];

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(value);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            <Sparkles size={14} />
            PERSONAL HEALTH SPACE
          </span>

          <h1>Your Health Dashboard</h1>

          <p>
            Your health documents, organized in one place.
            Review your records and explore your health information.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "dashboard-spinning" : ""}
          />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <span className="dashboard-welcome-label">
            YOUR PERSONAL HEALTH COPILOT
          </span>

          <h2>Better organized. Better informed.</h2>

          <p>
            Keep your medical documents together and prepare
            for more informed conversations with your healthcare
            professional.
          </p>

          <button
            type="button"
            className="dashboard-primary-action"
            onClick={() => navigate("/records")}
          >
            <Upload size={17} />
            Manage health records
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="dashboard-welcome-art" aria-hidden="true">
          <div className="dashboard-art-orbit orbit-one" />
          <div className="dashboard-art-orbit orbit-two" />

          <div className="dashboard-art-icon">
            <Brain size={52} strokeWidth={1.5} />
            <span className="dashboard-art-pulse">
              <Activity size={20} />
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-error" role="alert">
          <AlertCircle size={20} />

          <span>{error}</span>

          <button type="button" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      )}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Health overview</h2>
            <p>A quick look at your stored health information.</p>
          </div>
        </div>

        <div className="dashboard-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                className="dashboard-stat-card"
                key={stat.title}
              >
                <div className={`dashboard-stat-icon ${stat.color}`}>
                  <Icon size={22} />
                </div>

                <div className="dashboard-stat-info">
                  <p>{stat.title}</p>
                  <h3>{loading ? "—" : stat.value}</h3>
                  <span>{stat.description}</span>
                </div>

                <ArrowUpRight
                  size={18}
                  className="dashboard-stat-arrow"
                />
              </article>
            );
          })}
        </div>
      </section>

      <div className="dashboard-lower-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent health records</h2>
              <p>Your latest uploaded documents.</p>
            </div>

            <button
              type="button"
              className="dashboard-text-action"
              onClick={() => navigate("/records")}
            >
              View all
              <ArrowUpRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              <RefreshCw size={24} />
              <p>Loading your health information...</p>
            </div>
          ) : error ? (
            <div className="dashboard-empty">
              <AlertCircle size={25} />
              <p>Records are unavailable. Please retry.</p>
            </div>
          ) : recentRecords.length > 0 ? (
            <div className="dashboard-record-list">
              {recentRecords.map((record, index) => (
                <article
                  className="dashboard-record"
                  key={record.id ?? index}
                >
                  <div className="dashboard-record-icon">
                    <FileText size={21} />
                  </div>

                  <div className="dashboard-record-info">
                    <h3>
                      {record.name ||
                        record.title ||
                        record.file_name ||
                        "Health document"}
                    </h3>

                    <p>
                      {record.type ||
                        record.record_type ||
                        "Medical document"}
                    </p>

                    <span className="dashboard-mobile-date">
                      {formatDate(
                        record.date ||
                          record.created_at ||
                          record.uploaded_at
                      )}
                    </span>
                  </div>

                  <span className="dashboard-record-date">
                    {formatDate(
                      record.date ||
                        record.created_at ||
                        record.uploaded_at
                    )}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Files size={30} />
              <h3>No records available</h3>
              <p>
                Upload a medical document to see it displayed here.
              </p>

              <button
                type="button"
                className="dashboard-text-action"
                onClick={() => navigate("/records")}
              >
                Go to Health Records
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>

        <section className="dashboard-panel dashboard-distribution">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Record distribution</h2>
              <p>Breakdown by document category.</p>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              <RefreshCw size={23} />
              <p>Loading distribution...</p>
            </div>
          ) : error ? (
            <div className="dashboard-empty">
              <p>Distribution is unavailable.</p>
            </div>
          ) : totalRecords === 0 ? (
            <div className="dashboard-empty">
              <Activity size={28} />
              <p>Your record distribution will appear here.</p>
            </div>
          ) : (
            <>
              <div className="dashboard-distribution-total">
                <div>
                  <span>Total documents</span>
                  <h3>{totalRecords}</h3>
                </div>

                <div className="dashboard-distribution-total-icon">
                  <Files size={23} />
                </div>
              </div>

              <div
                className="dashboard-distribution-bar"
                aria-label="Record category distribution"
              >
                {distribution.map((item) =>
                  item.value > 0 ? (
                    <span
                      key={item.label}
                      className={`distribution-segment ${item.color}`}
                      style={{
                        width: `${(item.value / totalRecords) * 100}%`,
                      }}
                      title={`${item.label}: ${item.value}`}
                    />
                  ) : null
                )}
              </div>

              <div className="dashboard-distribution-list">
                {distribution.map((item) => (
                  <div
                    className="dashboard-distribution-item"
                    key={item.label}
                  >
                    <span
                      className={`distribution-dot ${item.color}`}
                    />

                    <span>{item.label}</span>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <section className="dashboard-quick-actions">
        <button
          type="button"
          className="dashboard-quick-card"
          onClick={() => navigate("/records")}
        >
          <div className="quick-action-icon upload-action">
            <Files size={23} />
          </div>

          <div>
            <h3>Health Records</h3>
            <p>Manage your medical documents.</p>
          </div>

          <ArrowUpRight size={18} />
        </button>

        <button
          type="button"
          className="dashboard-quick-card"
          onClick={() => navigate("/insights")}
        >
          <div className="quick-action-icon insights-action">
            <Brain size={23} />
          </div>

          <div>
            <h3>AI Health Insights</h3>
            <p>Extract text and review report summaries.</p>
          </div>

          <ArrowUpRight size={18} />
        </button>

        <div className="dashboard-quick-card dashboard-info-card">
          <div className="quick-action-icon calendar-action">
            <CalendarDays size={23} />
          </div>

          <div>
            <h3>Stay organized</h3>
            <p>Keep reports ready for your next appointment.</p>
          </div>
        </div>
      </section>

      <p className="dashboard-disclaimer">
        This dashboard organizes uploaded information for
        educational use. It does not diagnose medical conditions
        or replace professional medical advice.
      </p>
    </main>
  );
}
