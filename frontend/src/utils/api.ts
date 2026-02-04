const DEFAULT_API_URL = "http://127.0.0.1:8000/api";

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const getStoredBasicAuth = (): string | null =>
  localStorage.getItem("basicAuth");

export const setStoredBasicAuth = (username: string, password: string) => {
  const token = btoa(`${username}:${password}`);
  localStorage.setItem("basicAuth", token);
  return token;
};

export const clearStoredBasicAuth = () => {
  localStorage.removeItem("basicAuth");
};

const getBasicAuthToken = (): string | null => getStoredBasicAuth();

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getBasicAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Basic ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401) {
    clearStoredBasicAuth();
    window.dispatchEvent(new Event("auth:logout"));
  }
  return response;
};
