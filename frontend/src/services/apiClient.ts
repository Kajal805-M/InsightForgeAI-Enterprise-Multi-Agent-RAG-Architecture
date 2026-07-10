import axios from 'axios';
import { Toast } from '../components/Toast';

export interface ChatSession {
  session_id: number;
  title: string;
  created_at?: string;
}

export interface ChatMessage {
  id: number;
  sender: 'User' | 'AI';
  content: string;
  timestamp: string;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global API errors here (e.g. 401 Unauthorized)
    const msg = error.response?.data?.message || 'An unexpected error occurred.';
    Toast(msg, 'error');
    return Promise.reject(error);
  }
);

export const api = {
  getDocuments: async () => {
    const { data } = await apiClient.get('/documents/');
    return data;
  },
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },
  
  // Chat Endpoints
  getChatSessions: async (): Promise<ChatSession[]> => {
    const { data } = await apiClient.get('/chat/sessions');
    return data;
  },
  createChatSession: async (): Promise<ChatSession> => {
    const { data } = await apiClient.post('/chat/');
    return data;
  },
  deleteChatSession: async (sessionId: number): Promise<{status: string}> => {
    const { data } = await apiClient.delete(`/chat/sessions/${sessionId}`);
    return data;
  },
  getChatHistory: async (sessionId: number): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get(`/chat/${sessionId}/history`);
    return data;
  },

  getAnalyticsDatasets: async () => {
    const { data } = await apiClient.get('/analytics/datasets');
    return data;
  },
  runAnalytics: async (documentId: number) => {
    const { data } = await apiClient.get(`/analytics/${documentId}`);
    return data;
  },
  generateReport: async (documentId: number) => {
    const { data } = await apiClient.post(`/reports/generate/${documentId}`);
    return data;
  },
  getSystemStatus: async () => {
    const { data } = await apiClient.get('/system/status');
    return data;
  }
};
