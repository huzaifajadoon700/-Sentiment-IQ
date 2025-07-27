/**
 * API service for sentiment analysis
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AnalysisRequest,
  AnalysisResponse,
  BatchAnalysisRequest,
  BatchAnalysisResponse,
  HealthStatus,
  ModelInfo,
  ApiError
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error);
        
        // Handle different error types
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to the server. Please ensure the backend is running.');
        } else if (error.code === 'ETIMEDOUT') {
          throw new Error('Request timed out. Please try again.');
        } else if (error.response) {
          // Server responded with error status
          const errorData = error.response.data as ApiError;
          throw new Error(errorData.message || errorData.error || 'Server error occurred');
        } else {
          throw new Error('Network error occurred. Please check your connection.');
        }
      }
    );
  }

  /**
   * Analyze sentiment of a single text
   */
  async analyzeSentiment(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await this.api.post<AnalysisResponse>('/api/sentiment/analyze', request);
      return response.data;
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment of multiple texts
   */
  async analyzeBatchSentiment(request: BatchAnalysisRequest): Promise<BatchAnalysisResponse> {
    try {
      const response = await this.api.post<BatchAnalysisResponse>('/api/sentiment/batch', request);
      return response.data;
    } catch (error) {
      console.error('❌ Batch sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await this.api.get<HealthStatus>('/health');
      return response.data;
    } catch (error) {
      console.error('❌ Health check error:', error);
      throw error;
    }
  }

  /**
   * Get detailed health status
   */
  async getDetailedHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await this.api.get<HealthStatus>('/health/detailed');
      return response.data;
    } catch (error) {
      console.error('❌ Detailed health check error:', error);
      throw error;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.api.get<{ success: boolean; data: ModelInfo[] }>('/api/sentiment/models');
      return response.data.data;
    } catch (error) {
      console.error('❌ Get models error:', error);
      throw error;
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<any> {
    try {
      const response = await this.api.get('/api/sentiment/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Get stats error:', error);
      throw error;
    }
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.api.get('/');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Update API configuration
   */
  updateConfig(config: { baseURL?: string; timeout?: number }) {
    if (config.baseURL) {
      this.baseURL = config.baseURL;
      this.api.defaults.baseURL = config.baseURL;
    }
    
    if (config.timeout) {
      this.api.defaults.timeout = config.timeout;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export utility functions
export const validateText = (text: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Text cannot be empty');
  }
  
  if (text.length > 5000) {
    errors.push('Text cannot exceed 5000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatSentiment = (sentiment: string): string => {
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1).toLowerCase();
};

export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return '#10B981'; // Green
    case 'negative':
      return '#EF4444'; // Red
    case 'neutral':
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
};

export const getSentimentEmoji = (sentiment: string): string => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😞';
    case 'neutral':
      return '😐';
    default:
      return '🤔';
  }
};

export default apiService;
