// Type definitions for the sentiment analysis app

export interface SentimentResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  probabilities?: {
    Positive: number;
    Negative: number;
    Neutral: number;
  };
  emoji?: string;
  processingTime?: string;
  fromCache?: boolean;
}

export interface AnalysisRequest {
  text: string;
  options?: {
    includeConfidence?: boolean;
    model?: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  data?: SentimentResult;
  error?: string;
  timestamp?: string;
  processingTime?: string;
}

export interface BatchAnalysisRequest {
  texts: string[];
  options?: {
    includeConfidence?: boolean;
    model?: string;
  };
}

export interface BatchAnalysisResponse {
  success: boolean;
  data?: SentimentResult[];
  count?: number;
  error?: string;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime?: number;
  services?: {
    api: string;
    mlService?: string;
    mlServiceResponse?: number;
  };
}

export interface ModelInfo {
  name: string;
  type: string;
  accuracy?: number;
  classes: string[];
  isDefault: boolean;
}

export interface AppState {
  currentText: string;
  isAnalyzing: boolean;
  result: SentimentResult | null;
  error: string | null;
  history: AnalysisHistoryItem[];
}

export interface AnalysisHistoryItem {
  id: string;
  text: string;
  result: SentimentResult;
  timestamp: Date;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Component Props Types
export interface SentimentAnalyzerProps {
  onAnalysisComplete?: (result: SentimentResult) => void;
  onError?: (error: string) => void;
}

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface ResultDisplayProps {
  result: SentimentResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface ConfidenceBarProps {
  probabilities: {
    Positive: number;
    Negative: number;
    Neutral: number;
  };
  sentiment: string;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export interface HistoryItemProps {
  item: AnalysisHistoryItem;
  onReanalyze?: (text: string) => void;
  onDelete?: (id: string) => void;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
