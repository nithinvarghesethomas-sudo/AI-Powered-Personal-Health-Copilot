
import api from "./api";

export async function getHealthRecords() {
  const response = await api.get("records/");
  return response.data;
}

export async function uploadHealthRecord(formData) {
  const response = await api.post("records/", formData);
  return response.data;
}

export async function summarizeHealthRecord(recordId) {
  const response = await api.post(
    `records/${recordId}/summarize/`,
    {}
  );
  return response.data;
}

export async function getSavedHealthSummary(recordId) {
  const response = await api.get(
    `records/${recordId}/saved-summary/`
  );
  return response.data;
}
