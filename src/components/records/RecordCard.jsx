import { FileText, ArrowUpRight, Trash2 } from "lucide-react";
import StatusBadge from "../common/statusbadge";

export default function RecordCard({ record, onDelete, onOpen }) {
  if (!record) return null;

  return (
    <article className="record-card">
      <div className="record-file-icon">
        <FileText size={22} />
      </div>

      <div className="record-main">
        <h3>{record.name}</h3>
        <div className="record-meta">
          <span>{record.type}</span>
          <span>•</span>
          <span>{record.date}</span>
          {record.format && (
            <>
              <span>•</span>
              <span>{record.format}</span>
            </>
          )}
        </div>
      </div>

      <StatusBadge status={record.status || "Demo"} />

      {onDelete && (
        <button
          type="button"
          className="record-action"
          onClick={() => onDelete(record.id)}
          aria-label={`Remove ${record.name}`}
        >
          <Trash2 size={17} />
        </button>
      )}

      {onOpen && (
        <button
          type="button"
          className="record-action"
          onClick={() => onOpen(record)}
          aria-label={`Open ${record.name}`}
        >
          <ArrowUpRight size={17} />
        </button>
      )}
    </article>
  );
}