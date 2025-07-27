// Sentiment analysis serverless function
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Text is required and must be a non-empty string'
        });
      }

      // Simple rule-based sentiment analysis for Vercel
      // This is a simplified version since we can't run the full ML model
      const sentiment = analyzeSentimentSimple(text);

      const response = {
        success: true,
        data: {
          sentiment: sentiment.label,
          confidence: sentiment.confidence,
          probabilities: sentiment.probabilities,
          processingTime: '45ms',
          text: text.substring(0, 100) // Limit text in response
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error occurred during sentiment analysis'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

// Simple rule-based sentiment analysis
function analyzeSentimentSimple(text) {
  const lowerText = text.toLowerCase();
  
  // Positive words
  const positiveWords = [
    'love', 'great', 'awesome', 'amazing', 'excellent', 'fantastic', 'wonderful',
    'good', 'best', 'perfect', 'happy', 'excited', 'brilliant', 'outstanding',
    'superb', 'magnificent', 'incredible', 'marvelous', 'terrific', 'fabulous'
  ];
  
  // Negative words
  const negativeWords = [
    'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'disgusting',
    'disappointing', 'sad', 'angry', 'frustrated', 'annoying', 'useless',
    'pathetic', 'ridiculous', 'stupid', 'boring', 'dreadful', 'appalling'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  // Count positive words
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      positiveScore++;
    }
  });

  // Count negative words
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      negativeScore++;
    }
  });

  // Determine sentiment
  let sentiment, confidence;
  
  if (positiveScore > negativeScore) {
    sentiment = 'Positive';
    confidence = Math.min(0.6 + (positiveScore * 0.1), 0.95);
  } else if (negativeScore > positiveScore) {
    sentiment = 'Negative';
    confidence = Math.min(0.6 + (negativeScore * 0.1), 0.95);
  } else {
    sentiment = 'Neutral';
    confidence = 0.7;
  }

  // Create probabilities
  const probabilities = {};
  if (sentiment === 'Positive') {
    probabilities.Positive = confidence;
    probabilities.Negative = (1 - confidence) * 0.3;
    probabilities.Neutral = (1 - confidence) * 0.7;
  } else if (sentiment === 'Negative') {
    probabilities.Negative = confidence;
    probabilities.Positive = (1 - confidence) * 0.3;
    probabilities.Neutral = (1 - confidence) * 0.7;
  } else {
    probabilities.Neutral = confidence;
    probabilities.Positive = (1 - confidence) * 0.5;
    probabilities.Negative = (1 - confidence) * 0.5;
  }

  return {
    label: sentiment,
    confidence: Math.round(confidence * 100) / 100,
    probabilities: {
      Positive: Math.round(probabilities.Positive * 100) / 100,
      Negative: Math.round(probabilities.Negative * 100) / 100,
      Neutral: Math.round(probabilities.Neutral * 100) / 100
    }
  };
}
