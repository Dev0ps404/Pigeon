import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // Send cookies when cross-domain requests
});

export default api;
