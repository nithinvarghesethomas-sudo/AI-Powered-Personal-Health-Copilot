import { LoaderCircle } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      className={`app-button app-button-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <LoaderCircle size={16} className="button-loader" />}
      {children}
    </button>
  );
}