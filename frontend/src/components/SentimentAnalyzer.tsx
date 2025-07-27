import React, { useState, useCallback } from 'react';
import { apiService, validateText, getSentimentEmoji } from '../services/api';
import { SentimentResult, AnalysisRequest } from '../types';
import TextInput from './TextInput';
import ResultDisplay from './ResultDisplay';

const SentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    // Validate input
    const validation = validateText(text);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const request: AnalysisRequest = {
        text: text.trim(),
        options: {
          includeConfidence: true,
          model: 'random_forest'
        }
      };

      const response = await apiService.analyzeSentiment(request);

      if (response.success && response.data) {
        // Add emoji to result
        const resultWithEmoji = {
          ...response.data,
          emoji: getSentimentEmoji(response.data.sentiment)
        };
        
        setResult(resultWithEmoji);
        setError(null);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    // Clear previous results when text changes
    if (result || error) {
      setResult(null);
      setError(null);
    }
  }, [result, error]);

  const handleClear = useCallback(() => {
    setText('');
    setResult(null);
    setError(null);
  }, []);

  const handleTryExample = useCallback((exampleText: string) => {
    setText(exampleText);
    setResult(null);
    setError(null);
  }, []);

  const exampleTexts = [
    "I absolutely love this new product! It's amazing and works perfectly!",
    "This is the worst experience I've ever had. Completely disappointed.",
    "The weather is nice today. Just had lunch at a restaurant.",
    "I'm so excited about this new opportunity! Can't wait to get started!",
    "The service was okay, nothing special but it gets the job done."
  ];

  return (
    <div className="analyzer-container">
      <div className="analyzer-title">
        <h1>AI Sentiment Analysis</h1>
        <p>Discover the emotional tone of any text with advanced machine learning</p>
      </div>

      <div className="input-section">
        <TextInput
          value={text}
          onChange={handleTextChange}
          onSubmit={handleAnalyze}
          isLoading={isAnalyzing}
          placeholder="Enter your text here to analyze its sentiment... (e.g., 'I love this product!' or 'This is disappointing')"
          maxLength={5000}
        />
        
        <div className="input-actions">
          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
          >
            {isAnalyzing ? (
              <>
                <div className="button-spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-brain" />
                Analyze Sentiment
              </>
            )}
          </button>
          
          {text && (
            <button
              className="clear-button"
              onClick={handleClear}
              disabled={isAnalyzing}
            >
              <i className="fas fa-times" />
              Clear
            </button>
          )}
        </div>
      </div>

      <ResultDisplay
        result={result}
        isLoading={isAnalyzing}
        error={error}
      />

      {!text && !result && !isAnalyzing && (
        <div className="examples-section">
          <h3>Try these examples:</h3>
          <div className="example-buttons">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                className="example-button"
                onClick={() => handleTryExample(example)}
              >
                "{example.substring(0, 50)}..."
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <div className="model-info">
          <h4>
            <i className="fas fa-robot" />
            Model Information
          </h4>
          <p>
            Powered by a Random Forest model with <strong>97.4% accuracy</strong> trained on 
            74,000+ Twitter messages. Classifies text into Positive, Negative, or Neutral sentiments.
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-item">
            <i className="fas fa-zap" />
            <span>Real-time Analysis</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-chart-bar" />
            <span>Confidence Scores</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-shield-alt" />
            <span>Privacy Focused</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-mobile-alt" />
            <span>Mobile Friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
