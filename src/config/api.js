// All backend calls removed - dummy configuration only
const API_BASE_URL = 'dummy://localhost:3001/api';

const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export { API_BASE_URL, API_CONFIG };
