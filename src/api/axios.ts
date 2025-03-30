import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to ensure credentials are always included
api.interceptors.request.use(
  config => {
    // Ensure withCredentials is always true
    config.withCredentials = true;
    
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    config.headers['Access-Control-Allow-Credentials'] = 'true';
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request error:', error.request);
      return Promise.reject({ message: 'Unable to connect to server. Please check if the server is running and try again.' });
    } else {
      // Error in request setup
      console.error('Error:', error.message);
      return Promise.reject({ message: 'An error occurred. Please try again.' });
    }
  }
);

export default api;