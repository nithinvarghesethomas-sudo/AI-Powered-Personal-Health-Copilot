
import api from "./api";

export async function uploadHealthRecord(file, onProgress) {
  const formData = new FormData();

  formData.append("name", file.name);
  formData.append("record_type", "other");
  formData.append("description", "");
  formData.append("document", file);

  const response = await api.post("/records/", formData, {
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const percentage = Math.round(
          (event.loaded / event.total) * 100
        );

        onProgress(percentage);
      }
    },
  });

  return response.data;
}

export async function getHealthRecords() {
  const response = await api.get("/records/");
  return response.data;
}

export async function deleteHealthRecord(recordId) {
  const response = await api.delete(`/records/${recordId}/`);
  return response.data;
}
