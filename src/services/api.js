
const API_BASE_URL = "http://127.0.0.1:8000/api/";

export function saveAuthToken(token) {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  localStorage.setItem("health_copilot_token", token);
}

export function getAuthToken() {
  return localStorage.getItem("health_copilot_token");
}

export function clearAuthToken() {
  localStorage.removeItem("health_copilot_token");
}

async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  let body = options.body;

  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  // FormData upload: browser itself sets multipart Content-Type and boundary.
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  // Only convert ordinary JavaScript objects into JSON.
  if (
    body !== undefined &&
    body !== null &&
    typeof body !== "string" &&
    !isFormData
  ) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body,
    });
  } catch {
    throw new Error(
      "Cannot connect to Django backend. Make sure runserver is running at http://127.0.0.1:8000."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (typeof data.error === "string") {
        message = data.error;
      } else if (typeof data.message === "string") {
        message = data.message;
      } else {
        message = Object.entries(data)
          .map(([field, value]) => {
            const description = Array.isArray(value)
              ? value
                  .map((item) =>
                    typeof item === "string"
                      ? item
                      : JSON.stringify(item)
                  )
                  .join(", ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${field}: ${description}`;
          })
          .join(" ");
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return { data };
}

const api = {
  get(endpoint) {
    return request(endpoint);
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body,
    });
  },
};

export default api;
