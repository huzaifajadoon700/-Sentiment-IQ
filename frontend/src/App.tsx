import React, { useState, useEffect } from 'react';
import './styles/App.css';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import { apiService } from './services/api';
import { HealthStatus } from './types';

const App: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Check initial health status
    checkHealthStatus();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkHealthStatus, 30000); // Every 30 seconds
    
    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(healthCheckInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkHealthStatus = async () => {
    try {
      const status = await apiService.getHealthStatus();
      setHealthStatus(status);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          api: 'unhealthy'
        }
      });
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return '#EF4444'; // Red for offline
    if (!healthStatus) return '#F59E0B'; // Yellow for unknown
    
    switch (healthStatus.status) {
      case 'healthy':
        return '#10B981'; // Green
      case 'degraded':
        return '#F59E0B'; // Yellow
      case 'unhealthy':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!healthStatus) return 'Checking...';
    
    switch (healthStatus.status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'degraded':
        return 'Partial Service Available';
      case 'unhealthy':
        return 'Service Unavailable';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-brain" />
            <span>Sentiment AI</span>
          </div>
          
          <div className="header-stats">
            <div className="status-indicator">
              <div 
                className="status-dot"
                style={{ backgroundColor: getStatusColor() }}
              />
              <span>{getStatusText()}</span>
            </div>
            
            {healthStatus && healthStatus.uptime && (
              <div className="uptime-indicator">
                <i className="fas fa-clock" />
                <span>Uptime: {Math.floor(healthStatus.uptime / 60)}m</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {!isOnline ? (
          <div className="offline-message">
            <div className="offline-card">
              <i className="fas fa-wifi-slash" />
              <h2>You're Offline</h2>
              <p>Please check your internet connection and try again.</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo" />
                Retry
              </button>
            </div>
          </div>
        ) : healthStatus?.status === 'unhealthy' ? (
          <div className="service-unavailable">
            <div className="error-card">
              <i className="fas fa-exclamation-triangle" />
              <h2>Service Temporarily Unavailable</h2>
              <p>
                Our sentiment analysis service is currently experiencing issues. 
                Please try again in a few moments.
              </p>
              <button 
                className="retry-button"
                onClick={checkHealthStatus}
              >
                <i className="fas fa-redo" />
                Check Again
              </button>
            </div>
          </div>
        ) : (
          <SentimentAnalyzer />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>
              Powered by advanced machine learning • 
              <strong> 97.4% accuracy</strong> • 
              Trained on 74K+ samples
            </p>
          </div>
          
          <div className="footer-links">
            <a 
              href="https://github.com/your-repo/sentiment-web-app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <i className="fab fa-github" />
              Source Code
            </a>
            <a 
              href="/api/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <i className="fas fa-book" />
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
