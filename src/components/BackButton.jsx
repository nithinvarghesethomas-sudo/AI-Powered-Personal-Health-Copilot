
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BackButton.css";

export default function BackButton() {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <button
      type="button"
      className="back-button"
      onClick={handleBack}
    >
      <ArrowLeft size={18} />
      <span>Back</span>
    </button>
  );
}
