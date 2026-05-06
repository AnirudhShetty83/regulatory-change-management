import axios from 'axios';

// Use relative URLs so all requests go through the nginx proxy
// (nginx forwards /api/ and /auth/ to the backend container)
const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
