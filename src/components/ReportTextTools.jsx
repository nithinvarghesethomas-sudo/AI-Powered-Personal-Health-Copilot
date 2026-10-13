
import { useMemo, useState } from "react";
import "./ReportTextTools.css";

export default function ReportTextTools({ text = "" }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const lines = useMemo(() => {
    const allLines = text.split(/\r?\n/).filter((line) => line.trim());

    if (!query.trim()) return allLines;

    return allLines.filter((line) =>
      line.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [text, query]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Report text copied successfully.");
    } catch {
      setMessage("Copy failed. Please select and copy the text manually.");
    }
  }

  function downloadText() {
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "health-report-extracted-text.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setMessage("Report text download started.");
  }

  if (!text.trim()) return null;

  return (
    <section className="report-tools">
      <div className="report-tools-heading">
        <div>
          <h3>Extracted Report Text</h3>
          <p>Search, copy or save your extracted document text.</p>
        </div>

        <span className="report-line-count">
          {lines.length} lines
        </span>
      </div>

      <input
        className="report-search"
        type="search"
        placeholder="Search report text..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search extracted report text"
      />

      <div className="report-tool-actions">
        <button type="button" onClick={copyText}>
          Copy text
        </button>

        <button type="button" onClick={downloadText}>
          Download .txt
        </button>
      </div>

      {message && (
        <p className="report-tool-message" role="status">
          {message}
        </p>
      )}

      <div className="report-text-results">
        {lines.length > 0 ? (
          lines.map((line, index) => (
            <p key={`${index}-${line}`}>{line}</p>
          ))
        ) : (
          <p className="report-no-results">
            No matching lines found.
          </p>
        )}
      </div>
    </section>
  );
}
