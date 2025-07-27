import React from 'react';
import { ResultDisplayProps } from '../types';
import ConfidenceBar from './ConfidenceBar';
import LoadingSpinner from './LoadingSpinner';

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="results-section">
        <LoadingSpinner message="Analyzing sentiment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-section">
        <div className="error-card">
          <div className="error-icon">
            <i className="fas fa-exclamation-circle" />
          </div>
          <h3>Analysis Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-redo" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '#10B981';
      case 'negative':
        return '#EF4444';
      case 'neutral':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getConfidenceLevelColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="results-section">
      <div className="result-card">
        <div className="result-header">
          <div className="sentiment-display">
            <div className="sentiment-emoji">
              {result.emoji || '🤔'}
            </div>
            <div className="sentiment-info">
              <h3 style={{ color: getSentimentColor(result.sentiment) }}>
                {result.sentiment}
              </h3>
              <div className="confidence">
                <span 
                  className="confidence-level"
                  style={{ color: getConfidenceLevelColor(result.confidence) }}
                >
                  {getConfidenceLevel(result.confidence)} Confidence
                </span>
                <span className="confidence-percentage">
                  ({(result.confidence * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="result-meta">
            {result.processingTime && (
              <div className="processing-time">
                <i className="fas fa-clock" />
                <span>{result.processingTime}</span>
              </div>
            )}
            {result.fromCache && (
              <div className="cache-indicator">
                <i className="fas fa-bolt" />
                <span>Cached Result</span>
              </div>
            )}
          </div>
        </div>

        {result.probabilities && (
          <div className="confidence-section">
            <h4 className="confidence-title">
              <i className="fas fa-chart-bar" />
              Confidence Breakdown
            </h4>
            <ConfidenceBar 
              probabilities={result.probabilities}
              sentiment={result.sentiment}
            />
          </div>
        )}

        <div className="result-insights">
          <div className="insight-grid">
            <div className="insight-item">
              <div className="insight-icon">
                <i className="fas fa-brain" />
              </div>
              <div className="insight-content">
                <h5>AI Analysis</h5>
                <p>
                  The model is <strong>{getConfidenceLevel(result.confidence).toLowerCase()}</strong> confident 
                  this text expresses <strong>{result.sentiment.toLowerCase()}</strong> sentiment.
                </p>
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon">
                <i className="fas fa-lightbulb" />
              </div>
              <div className="insight-content">
                <h5>Interpretation</h5>
                <p>
                  {result.sentiment === 'Positive' && 'This text contains positive emotions, satisfaction, or approval.'}
                  {result.sentiment === 'Negative' && 'This text contains negative emotions, dissatisfaction, or criticism.'}
                  {result.sentiment === 'Neutral' && 'This text is factual, objective, or contains mixed emotions.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button 
            className="action-button secondary"
            onClick={() => {
              const resultText = `Sentiment: ${result.sentiment} (${(result.confidence * 100).toFixed(1)}% confidence)`;
              navigator.clipboard.writeText(resultText);
            }}
          >
            <i className="fas fa-copy" />
            Copy Result
          </button>
          
          <button 
            className="action-button secondary"
            onClick={() => {
              const data = {
                sentiment: result.sentiment,
                confidence: result.confidence,
                probabilities: result.probabilities,
                timestamp: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sentiment-analysis-result.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <i className="fas fa-download" />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
