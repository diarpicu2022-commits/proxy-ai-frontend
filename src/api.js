import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

export const generateText = (userId, prompt) =>
  api.post('/api/ai/generate', { userId, prompt });

export const getQuotaStatus = (userId) =>
  api.get('/api/quota/status', { params: { userId } });

export const getQuotaHistory = (userId) =>
  api.get('/api/quota/history', { params: { userId } });

export const upgradePlan = (userId, plan = 'PRO') =>
  api.post('/api/quota/upgrade', { userId, plan });
