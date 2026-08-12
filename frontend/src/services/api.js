import axios from 'axios';

const API_BASE_URL = 'https://military-asset-management-system-idxp-4xcphv1i9.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mams_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// ─── Assets / Dashboard ────────────────────────────────────
export const assetAPI = {
  getDashboard: (params) => api.get('/assets/dashboard', { params }),
  getBasesOverview: () => api.get('/assets/bases-overview'),
  getChartData: (params) => api.get('/assets/chart', { params }),
  getEquipmentTypes: () => api.get('/assets/equipment-types'),
  getBases: () => api.get('/assets/bases'),
};

// ─── Purchases ─────────────────────────────────────────────
export const purchaseAPI = {
  getAll: (params) => api.get('/purchases', { params }),
  create: (data) => api.post('/purchases', data),
};

// ─── Transfers ─────────────────────────────────────────────
export const transferAPI = {
  getAll: (params) => api.get('/transfers', { params }),
  create: (data) => api.post('/transfers', data),
};

// ─── Assignments ───────────────────────────────────────────
export const assignmentAPI = {
  getAll: (params) => api.get('/operations/assignments', { params }),
  create: (data) => api.post('/operations/assignments', data),
};

// ─── Expenditures ──────────────────────────────────────────
export const expenditureAPI = {
  getAll: (params) => api.get('/operations/expenditures', { params }),
  create: (data) => api.post('/operations/expenditures', data),
};

// ─── Audit Logs ────────────────────────────────────────────
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
};

export default api;
