import React from 'react';
import { ConfidenceBarProps } from '../types';

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ probabilities, sentiment }) => {
  const getSentimentClass = (sentimentType: string) => {
    return sentimentType.toLowerCase();
  };

  const getSentimentIcon = (sentimentType: string) => {
    switch (sentimentType.toLowerCase()) {
      case 'positive':
        return 'fas fa-smile';
      case 'negative':
        return 'fas fa-frown';
      case 'neutral':
        return 'fas fa-meh';
      default:
        return 'fas fa-question';
    }
  };

  const isHighestConfidence = (sentimentType: string) => {
    return sentimentType === sentiment;
  };

  return (
    <div className="confidence-bars">
      {Object.entries(probabilities).map(([sentimentType, probability]) => (
        <div 
          key={sentimentType} 
          className={`confidence-bar ${isHighestConfidence(sentimentType) ? 'highest' : ''}`}
        >
          <div className="confidence-label">
            <i className={getSentimentIcon(sentimentType)} />
            <span>{sentimentType}</span>
          </div>
          
          <div className="confidence-progress">
            <div 
              className={`confidence-fill ${getSentimentClass(sentimentType)}`}
              style={{ 
                width: `${probability * 100}%`,
                animationDelay: `${Object.keys(probabilities).indexOf(sentimentType) * 0.1}s`
              }}
            />
          </div>
          
          <div className="confidence-value">
            {(probability * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfidenceBar;
