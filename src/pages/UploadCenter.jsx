import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileImage,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { uploadHealthRecord } from "../services/healthRecordsService";
import "./UploadCenter.css";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function UploadCenter() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function addFiles(fileList) {
    const selectedFiles = Array.from(fileList || []);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: PDF, JPG, PNG, WEBP files mattum.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Maximum file size is 10 MB.`);
      } else {
        validFiles.push(file);
      }
    });

    setFiles((current) => {
      const combined = [...current, ...validFiles];
      return combined.filter(
        (file, index, array) =>
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified
          ) === index
      );
    });

    setError(errors.join(" "));
    setMessage("");
  }

  function removeFile(indexToRemove) {
    setFiles((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError("First medical document select pannunga.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");
    setProgress(0);

    try {
      let completed = 0;

      for (const file of files) {
        await uploadHealthRecord(file, (fileProgress) => {
          const overallProgress = Math.round(
            ((completed + fileProgress / 100) / files.length) * 100
          );

          setProgress(overallProgress);
        });

        completed += 1;
        setProgress(Math.round((completed / files.length) * 100));
      }

      setMessage("Medical documents successfully uploaded.");
      setFiles([]);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);

      setError(
        uploadError.response?.data?.detail ||
          uploadError.response?.data?.message ||
          "Upload failed. Backend URL and upload endpoint check pannunga."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-page">
      <div className="upload-page-heading">
        <div>
          <span className="upload-eyebrow">DOCUMENT CENTER</span>
          <h1>Upload Center</h1>
          <p>
            Upload medical reports and keep your health documents organized.
          </p>
        </div>
      </div>

      <div
        className={`upload-zone ${dragging ? "upload-zone-active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="upload-zone-icon">
          <UploadCloud size={32} />
        </div>

        <h2>Upload your health documents</h2>

        <p>
          Drag and drop your files here, or select files from your device.
        </p>

        <button
          type="button"
          className="upload-select-button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <FileText size={17} />
          Choose files
        </button>

        <span className="upload-zone-hint">
          PDF, JPG, PNG or WEBP · Maximum 10 MB per file
        </span>
      </div>

      {files.length > 0 && (
        <div className="upload-selected-files">
          <div className="upload-files-heading">
            <div>
              <h2>Selected documents</h2>
              <p>{files.length} file(s) ready for upload</p>
            </div>
          </div>

          {files.map((file, index) => (
            <div
              className="upload-file-item"
              key={`${file.name}-${file.lastModified}-${index}`}
            >
              <div className="upload-file-icon">
                {file.type.startsWith("image/") ? (
                  <FileImage size={22} />
                ) : (
                  <FileText size={22} />
                )}
              </div>

              <div className="upload-file-info">
                <strong>{file.name}</strong>
                <span>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <button
                type="button"
                className="upload-remove-button"
                onClick={() => removeFile(index)}
                disabled={uploading}
                aria-label={`Remove ${file.name}`}
              >
                <X size={18} />
              </button>
            </div>
          ))}

          {uploading && (
            <div className="upload-progress">
              <div className="upload-progress-label">
                <span>Uploading documents...</span>
                <span>{progress}%</span>
              </div>

              <div className="upload-progress-track">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className="upload-submit-button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            <UploadCloud size={18} />
            {uploading ? "Uploading..." : "Upload documents"}
          </button>
        </div>
      )}

      {message && (
        <div className="upload-feedback upload-success" role="status">
          <CheckCircle2 size={20} />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="upload-feedback upload-error" role="alert">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="upload-privacy-note">
        <AlertCircle size={18} />
        <p>
          Medical documents contain sensitive information. Upload only to
          your authorized account. Files are sent to your configured backend;
          secure storage depends on the backend implementation.
        </p>
      </div>
    </section>
  );
}
