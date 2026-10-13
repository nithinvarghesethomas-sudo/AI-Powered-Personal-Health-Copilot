
import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { uploadHealthRecord } from "../services/healthService";

export default function HealthRecordUpload({ onUploaded }) {
  const [name, setName] = useState("");
  const [recordType, setRecordType] = useState("lab_report");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a PDF or image file.");
      return;
    }

    const allowed = ["pdf", "jpg", "jpeg", "png", "webp"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(extension)) {
      setError("PDF, JPG, JPEG, PNG or WEBP files only.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("record_type", recordType);
    formData.append("description", description);
    formData.append("document", file);

    setLoading(true);

    try {
      await uploadHealthRecord(formData);
      setSuccess("Health record uploaded successfully!");
      setName("");
      setDescription("");
      setRecordType("lab_report");
      setFile(null);
      event.target.reset();

      if (onUploaded) await onUploaded();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data
          ? Object.values(data).flat().join(" ")
          : "Upload failed. Check login and backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="health-upload-form">
      <h2>Upload health document</h2>
      <p>PDF or image · Maximum 10 MB</p>

      <label htmlFor="record-name">Document name</label>
      <input
        id="record-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Blood test report"
        required
      />

      <label htmlFor="record-type">Document type</label>
      <select
        id="record-type"
        value={recordType}
        onChange={(e) => setRecordType(e.target.value)}
      >
        <option value="lab_report">Lab Report</option>
        <option value="prescription">Prescription</option>
        <option value="medical_record">Medical Record</option>
        <option value="health_update">Health Update</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="record-description">Description (optional)</label>
      <textarea
        id="record-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a short description"
        rows={3}
      />

      <label htmlFor="record-file">Choose document</label>
      <input
        id="record-file"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
      />

      {file && (
        <p><FileText size={16} /> {file.name}</p>
      )}

      {error && (
        <p role="alert" className="upload-error">
          <AlertCircle size={17} /> {error}
        </p>
      )}

      {success && (
        <p role="status" className="upload-success">
          <CheckCircle size={17} /> {success}
        </p>
      )}

      <button type="submit" disabled={loading}>
        <Upload size={17} />
        {loading ? "Uploading..." : "Upload document"}
      </button>
    </form>
  );
}
