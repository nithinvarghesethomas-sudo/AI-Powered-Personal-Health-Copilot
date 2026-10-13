import { useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function UploadZone({ onFilesSelected, multiple = true }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function processFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const invalidFiles = files.filter(
      (file) => !ACCEPTED_TYPES.includes(file.type)
    );

    if (invalidFiles.length) {
      setError("PDF, JPG, PNG, or WEBP files mattum upload pannunga.");
      return;
    }

    setError("");
    onFilesSelected?.(files);
  }

  return (
    <div
      className={`upload-zone ${dragging ? "upload-zone-active" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        processFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        multiple={multiple}
        hidden
        onChange={(event) => {
          processFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="upload-zone-icon">
        <UploadCloud size={28} />
      </div>

      <h3>Upload your health documents</h3>
      <p>PDF, JPG, PNG, or WEBP files</p>

      <button
        type="button"
        className="app-button app-button-primary"
        onClick={() => inputRef.current?.click()}
      >
        <FileText size={17} />
        Choose files
      </button>

      <span className="upload-zone-hint">
        Drag and drop files here, or choose from your device.
      </span>

      {error && <p className="upload-zone-error" role="alert">{error}</p>}
    </div>
  );
}