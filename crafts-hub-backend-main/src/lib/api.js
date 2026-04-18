const BASE_URL = import.meta.env.VITE_API_URL || "https://crafts-hub-backend.vercel.app/api";

const getToken = () => localStorage.getItem("crafts_token");

const headers = (isFormData = false) => {
  const h = {};
  if (!isFormData) h["Content-Type"] = "application/json";
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const authAPI = {
  register: (body) =>
    fetch(`${BASE_URL}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body) =>
    fetch(`${BASE_URL}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  me: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(handleResponse),
  updateProfile: (body) =>
    fetch(`${BASE_URL}/auth/profile`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
};

export const productsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/products${qs ? `?${qs}` : ""}`, { headers: headers() }).then(handleResponse);
  },
  getById: (id) => fetch(`${BASE_URL}/products/${id}`, { headers: headers() }).then(handleResponse),
  getMyProducts: () => fetch(`${BASE_URL}/products/my/products`, { headers: headers() }).then(handleResponse),
  create: (formData) => fetch(`${BASE_URL}/products`, { method: "POST", headers: headers(true), body: formData }).then(handleResponse),
  update: (id, formData) => fetch(`${BASE_URL}/products/${id}`, { method: "PUT", headers: headers(true), body: formData }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/products/${id}`, { method: "DELETE", headers: headers() }).then(handleResponse),
};

export const manufacturersAPI = {
  getAll: () => fetch(`${BASE_URL}/manufacturers`, { headers: headers() }).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/manufacturers/${id}`, { headers: headers() }).then(handleResponse),
};