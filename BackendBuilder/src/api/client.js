import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
});

export default client;
