
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  RefreshCw,
  FileText,
  AlertCircle,
  Files,
  Upload,
  CheckCircle,
  FileUp,
  CalendarDays,
  FlaskConical,
  Pill,
  HeartPulse,
  Clock3,
  Database,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

import {
  getHealthRecords,
  uploadHealthRecord,
} from "../services/healthService";

import "./HealthRecords.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];

const typeLabels = {
  lab_report: "Lab Report",
  prescription: "Prescription",
  medical_record: "Medical Record",
  health_update: "Health Update",
  other: "Other",
};

function getRecordType(record) {
  return record.record_type || record.type || "other";
}

function getRecordDate(record) {
  const value = record.date || record.created_at;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date =
    value instanceof Date
      ? value
      : getRecordDate({ date: value });

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getRecordIcon(type) {
  if (type === "lab_report") return FlaskConical;
  if (type === "prescription") return Pill;
  if (type === "health_update") return HeartPulse;

  return FileText;
}

function getFHIRPreview(record) {
  const type = getRecordType(record);

  let resourceType = "DocumentReference";

  if (type === "lab_report") {
    resourceType = "DiagnosticReport";
  } else if (type === "prescription") {
    resourceType = "MedicationStatement";
  } else if (type === "health_update") {
    resourceType = "Observation";
  }

  const date = getRecordDate(record);

  return {
    resourceType,
    status: "unknown",
    identifier: `DEMO-RECORD-${record.id ?? "UNASSIGNED"}`,
    description:
      record.description || record.name || "Health document",
    category: type,
    date: date ? date.toISOString() : null,
    source: "Health Copilot demo preview",
    note:
      "Simplified FHIR-inspired preview only. This is not a validated FHIR resource, and clinical values must be extracted and verified separately.",
  };
}

function getErrorMessage(error, fallback) {
  if (error?.status === 401) {
    return "Your session may have expired. Please log in again.";
  }

  if (error?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  return error?.message || fallback;
}

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    record_type: "lab_report",
    description: "",
  });

  const [file, setFile] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getHealthRecords();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.records)
            ? data.records
            : null;

      if (!items) {
        throw new Error(
          "Unexpected response from the health records API."
        );
      }

      setRecords(items);
    } catch (err) {
      console.error("Health records API error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load health records. Check your login and backend connection."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    setUploadError("");
    setSuccess("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFile(null);
      event.target.value = "";

      setUploadError(
        "Unsupported file. Select PDF, JPG, JPEG, PNG or WEBP."
      );

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = "";

      setUploadError("Maximum file size is 10 MB.");

      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      event.target.value = "";

      setUploadError("The selected file is empty.");

      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload(event) {
    event.preventDefault();

    setUploadError("");
    setSuccess("");

    if (!form.name.trim()) {
      setUploadError("Please enter a document name.");
      return;
    }

    if (!file) {
      setUploadError("Please select a medical document.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Maximum file size is 10 MB.");
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("record_type", form.record_type);
    formData.append("description", form.description.trim());

    // This field name must match the Django model/serializer.
    formData.append("document", file);

    setUploading(true);

    try {
      await uploadHealthRecord(formData);

      setForm({
        name: "",
        record_type: "lab_report",
        description: "",
      });

      setFile(null);

      const fileInput = document.getElementById(
        "health-record-file"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccess(
        "Your health record was uploaded successfully!"
      );

      // Reload the list after a successful upload.
      await loadRecords();
    } catch (err) {
      console.error("Health record upload error:", err);

      setUploadError(
        getErrorMessage(
          err,
          "Upload failed. Please check the backend and try again."
        )
      );
    } finally {
      setUploading(false);
    }
  }

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const dateA = getRecordDate(a)?.getTime() || 0;
      const dateB = getRecordDate(b)?.getTime() || 0;

      return dateB - dateA;
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (filter === "all") return sortedRecords;

    return sortedRecords.filter(
      (record) => getRecordType(record) === filter
    );
  }, [sortedRecords, filter]);

  const groupedRecords = useMemo(() => {
    const groups = new Map();

    filteredRecords.forEach((record, index) => {
      const date = getRecordDate(record);

      const key = date
        ? `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`
        : "unknown";

      const title = date
        ? date.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })
        : "Date unavailable";

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          title,
          records: [],
          sortTime: date?.getTime() || 0,
        });
      }

      groups.get(key).records.push({
        ...record,
        _timelineKey: record.id ?? `${key}-${index}`,
      });
    });

    return [...groups.values()].sort(
      (a, b) => b.sortTime - a.sortTime
    );
  }, [filteredRecords]);

  const labCount = records.filter(
    (record) => getRecordType(record) === "lab_report"
  ).length;

  const prescriptionCount = records.filter(
    (record) => getRecordType(record) === "prescription"
  ).length;

  return (
    <section className="dashboard-page health-records-page">
      <header className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            YOUR HEALTH LIBRARY
          </span>

          <h1>Health Records &amp; Timeline</h1>

          <p>
            Organize your medical documents and review your health
            history in one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadRecords}
          disabled={loading}
        >
          <RefreshCw size={17} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="health-summary-cards">
        <article className="health-summary-card">
          <div className="health-summary-icon blue">
            <Files size={21} />
          </div>

          <span>Total records</span>
          <strong>{records.length}</strong>
          <small>Uploaded documents</small>
        </article>

        <article className="health-summary-card">
          <div className="health-summary-icon purple">
            <FlaskConical size={21} />
          </div>

          <span>Lab reports</span>
          <strong>{labCount}</strong>
          <small>Diagnostic documents</small>
        </article>

        <article className="health-summary-card">
          <div className="health-summary-icon teal">
            <Pill size={21} />
          </div>

          <span>Prescriptions</span>
          <strong>{prescriptionCount}</strong>
          <small>Stored medication documents</small>
        </article>
      </section>

      <section className="health-upload-panel">
        <div className="health-upload-heading">
          <div className="health-upload-icon">
            <FileUp size={23} />
          </div>

          <div>
            <h2>Upload a health document</h2>
            <p>
              Add a lab report, prescription or medical record.
            </p>
          </div>
        </div>

        <form
          className="health-upload-form"
          onSubmit={handleUpload}
        >
          <div className="health-form-grid">
            <div className="health-form-field">
              <label htmlFor="health-record-name">
                Document name
              </label>

              <input
                id="health-record-name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Blood test report"
                maxLength={255}
                required
              />
            </div>

            <div className="health-form-field">
              <label htmlFor="health-record-type">
                Document type
              </label>

              <select
                id="health-record-type"
                name="record_type"
                value={form.record_type}
                onChange={handleFormChange}
              >
                <option value="lab_report">Lab Report</option>
                <option value="prescription">Prescription</option>
                <option value="medical_record">
                  Medical Record
                </option>
                <option value="health_update">
                  Health Update
                </option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="health-form-field">
            <label htmlFor="health-record-description">
              Description{" "}
              <span className="health-optional">
                (optional)
              </span>
            </label>

            <textarea
              id="health-record-description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Add a short note about this document..."
              rows={3}
            />
          </div>

          <div className="health-form-field">
            <label htmlFor="health-record-file">
              Medical document
            </label>

            <label
              className="health-file-dropzone"
              htmlFor="health-record-file"
            >
              <Upload size={26} />

              <strong>
                {file
                  ? file.name
                  : "Choose a file to upload"}
              </strong>

              <span>
                PDF, JPG, JPEG, PNG or WEBP · Max 10 MB
              </span>

              {file && (
                <span>{formatFileSize(file.size)}</span>
              )}
            </label>

            <input
              className="health-file-input"
              id="health-record-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              required
            />
          </div>

          {uploadError && (
            <div
              className="health-upload-message error"
              role="alert"
            >
              <AlertCircle size={19} />
              <span>{uploadError}</span>
            </div>
          )}

          {success && (
            <div
              className="health-upload-message success"
              role="status"
            >
              <CheckCircle size={19} />
              <span>{success}</span>
            </div>
          )}

          <div className="health-upload-actions">
            <p>
              <AlertCircle size={15} />
              Only upload documents you are authorized to store.
            </p>

            <button
              type="submit"
              className="health-upload-button"
              disabled={uploading}
            >
              <Upload size={17} />
              {uploading
                ? "Uploading..."
                : "Upload document"}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="dashboard-error" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>

          <button
            type="button"
            onClick={loadRecords}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      <section className="dashboard-panel health-timeline-panel">
        <div className="dashboard-panel-heading health-timeline-heading">
          <div>
            <h2>
              <Clock3 size={21} />
              Health Timeline
            </h2>

            <p>
              Your uploaded documents, grouped by month.
            </p>
          </div>

          <label className="health-timeline-filter">
            <span>Filter</span>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="all">All records</option>
              <option value="lab_report">Lab reports</option>
              <option value="prescription">
                Prescriptions
              </option>
              <option value="medical_record">
                Medical records
              </option>
              <option value="health_update">
                Health updates
              </option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <RefreshCw size={24} />
            <p>Loading your health timeline...</p>
          </div>
        ) : error ? (
          <div className="dashboard-empty">
            <Files size={28} />
            <p>Timeline records could not be loaded.</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="dashboard-empty">
            <Files size={30} />
            <h3>No matching records</h3>
            <p>
              Upload a document or select a different filter.
            </p>
          </div>
        ) : (
          <div className="health-timeline">
            {groupedRecords.map((group) => (
              <section
                className="health-timeline-group"
                key={group.key}
              >
                <h3 className="health-timeline-month">
                  <CalendarDays size={17} />
                  {group.title}
                  <span>{group.records.length}</span>
                </h3>

                <div className="health-timeline-items">
                  {group.records.map((record) => {
                    const type = getRecordType(record);
                    const Icon = getRecordIcon(type);
                    const preview = getFHIRPreview(record);

                    const recordKey =
                      record.id ?? record._timelineKey;

                    const expanded =
                      String(expandedId) ===
                      String(recordKey);

                    return (
                      <article
                        className="health-timeline-item"
                        key={record._timelineKey}
                      >
                        <div className="health-timeline-marker">
                          <Icon size={19} />
                        </div>

                        <div className="health-timeline-card">
                          <div className="health-timeline-card-top">
                            <div>
                              <span
                                className={`health-type-badge type-${type}`}
                              >
                                {typeLabels[type] ||
                                  "Medical Document"}
                              </span>

                              <h4>
                                {record.name ||
                                  record.title ||
                                  "Health document"}
                              </h4>

                              <p className="health-timeline-date">
                                <CalendarDays size={14} />
                                {formatDate(
                                  record.date ||
                                    record.created_at
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="health-fhir-toggle"
                              onClick={() =>
                                setExpandedId(
                                  expanded ? null : recordKey
                                )
                              }
                              aria-expanded={expanded}
                            >
                              <Database size={15} />
                              FHIR preview

                              <ChevronDown
                                size={15}
                                className={
                                  expanded ? "rotated" : ""
                                }
                              />
                            </button>
                          </div>

                          {record.description && (
                            <p className="health-timeline-description">
                              {record.description}
                            </p>
                          )}

                          {expanded && (
                            <div className="health-fhir-preview">
                              <div className="health-fhir-preview-heading">
                                <Database size={18} />

                                <div>
                                  <strong>
                                    {preview.resourceType}
                                  </strong>

                                  <span>
                                    FHIR-inspired demo preview
                                  </span>
                                </div>
                              </div>

                              <pre>
                                {JSON.stringify(
                                  preview,
                                  null,
                                  2
                                )}
                              </pre>

                              <p className="health-fhir-note">
                                Demo structure only. No clinical
                                values are invented or inferred.
                              </p>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="health-demo-id-panel">
        <div className="health-demo-id-icon">
          <ShieldCheck size={24} />
        </div>

        <div>
          <span className="dashboard-eyebrow">
            INTEROPERABILITY DEMO
          </span>

          <h2>ABDM-ready design concept</h2>

          <p>
            This prototype organizes health records in a
            structured format inspired by FHIR. Official ABHA
            linking, identity verification and ABDM APIs are not
            connected in this demo.
          </p>

          <span className="health-demo-id-label">
            Demo status: Not connected to ABDM
          </span>
        </div>
      </section>

      <p className="dashboard-disclaimer">
        This application organizes uploaded health information.
        Extracted content may contain errors and should be checked
        against the original document. It does not diagnose medical
        conditions or replace professional medical advice.
      </p>
    </section>
  );
}
