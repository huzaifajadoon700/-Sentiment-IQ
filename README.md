# 🎭 Sentiment Analysis Web Application

A full-stack web application that analyzes the emotional tone of text using machine learning. Built with React frontend, Node.js backend, and Python ML service.

## 🌟 What This Project Does

This application analyzes text and determines whether the sentiment is:

- **😊 Positive** - Happy, excited, satisfied emotions
- **😠 Negative** - Angry, sad, disappointed emotions
- **😐 Neutral** - Factual, balanced, or emotionally neutral

The AI model provides confidence scores showing how certain it is about each prediction, helping you understand the reliability of the analysis.

## 🏗️ Project Architecture

```
sentiment-web-app/
├── 📱 frontend/          # React.js application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── styles/       # CSS/styling
│   │   └── utils/        # Utility functions
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── 🚀 backend/           # Node.js Express server
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── package.json      # Backend dependencies
│
├── 🤖 ml-service/        # Python ML service
│   ├── models/           # Trained ML models
│   ├── api/              # Python API endpoints
│   ├── predict.py        # Prediction logic
│   └── requirements.txt  # Python dependencies
│
├── 🔄 shared/            # Shared utilities
│   ├── types/            # TypeScript types
│   └── constants/        # Shared constants
│
└── 📚 docs/              # Documentation
    ├── api.md            # API documentation
    └── deployment.md     # Deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Python dependencies
cd ../ml-service
pip install -r requirements.txt
```

### 2. Start the Application

You need to run **3 services** in the correct order:

#### Option 1: Manual Start (Recommended for Development)

**Terminal 1 - Start ML Service:**

```bash
cd ml-service
python app.py
```

_Wait for: "✅ Models loaded successfully" and "Running on http://127.0.0.1:8000"_

**Terminal 2 - Start Backend:**

```bash
cd backend
npm run dev
```

_Wait for: "🚀 Server running on port 5000"_

**Terminal 3 - Start Frontend:**

```bash
cd frontend
npm start
```

_Wait for: "Compiled successfully!" and browser opens_

#### Option 2: Quick Start Script

```bash
# Create and run start script
./start-all.bat  # Windows
# or
./start-all.sh   # Linux/Mac
```

### 3. Access the Application

Once all services are running:

- **🎭 Main Application**: http://localhost:3000
- **🚀 Backend API**: http://localhost:5000
- **🤖 ML Service**: http://localhost:8000

## 📝 Usage Examples

### 😊 Positive Sentiment Examples:

**Enthusiastic:**

- "I absolutely love this project! It's amazing!"
- "This is the best day ever! Everything is perfect!"
- "Fantastic work! I'm so impressed and excited!"
- "Outstanding performance! You exceeded all expectations!"

**Happy/Satisfied:**

- "I'm really happy with the results"
- "This makes me feel great and confident"
- "Wonderful experience, highly recommend it"
- "I'm grateful for this opportunity"

**Appreciative:**

- "Thank you so much for your help"
- "I appreciate all the hard work"
- "This is exactly what I needed"
- "You're doing an excellent job"

### 😠 Negative Sentiment Examples:

**Angry/Frustrated:**

- "This is absolutely terrible and disappointing!"
- "I hate this! It's completely useless!"
- "Worst experience ever! Total waste of time!"
- "I'm furious about this poor quality"

**Sad/Disappointed:**

- "I'm really disappointed with the outcome"
- "This makes me feel sad and hopeless"
- "I regret making this decision"
- "This is not what I expected at all"

**Critical:**

- "The service is poor and unreliable"
- "This product is broken and defective"
- "Terrible customer support, very unhelpful"
- "I would not recommend this to anyone"

### 😐 Neutral Sentiment Examples:

**Factual/Informative:**

- "The meeting is scheduled for 3 PM today"
- "The weather forecast shows rain tomorrow"
- "The report contains 50 pages of data"
- "The store opens at 9 AM on weekdays"

**Descriptive:**

- "The car is blue and has four doors"
- "The book has 300 pages and costs $15"
- "The building is located on Main Street"
- "The software requires Windows 10 or higher"

**Balanced/Mixed:**

- "The product has some good features but also some issues"
- "It's okay, nothing special but not bad either"
- "The service was average, could be better"
- "Some parts were interesting, others were boring"

### 🎯 Fun Test Examples:

- "Pizza is life! 🍕" (Expected: Positive)
- "Monday mornings are the worst" (Expected: Negative)
- "Coffee contains caffeine" (Expected: Neutral)
- "I'm over the moon about this news!" (Expected: Positive)
- "This traffic jam is driving me crazy" (Expected: Negative)
- "The clock shows 2:30 PM" (Expected: Neutral)

## 🎯 Features

- ✨ **Real-time Sentiment Analysis**: Instant text sentiment prediction
- 🎨 **Modern UI**: Clean, responsive React interface
- 🚀 **Fast API**: Express.js backend with optimized endpoints
- 🤖 **High Accuracy ML**: 97.4% accuracy sentiment classification
- 📱 **Mobile Responsive**: Works on all device sizes
- 🔄 **Real-time Updates**: Live sentiment analysis as you type
- 📊 **Confidence Scores**: Shows prediction confidence levels

## 🛠️ Technology Stack

### Frontend

- **React.js** - UI framework
- **Axios** - HTTP client
- **CSS3** - Styling
- **React Hooks** - State management

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin requests
- **Body-parser** - Request parsing

### ML Service

- **Python** - ML runtime
- **Flask** - Python web framework
- **scikit-learn** - Machine learning
- **NLTK** - Natural language processing
- **joblib** - Model serialization

## 📡 API Endpoints

### Backend API (Port 5000)

#### Health Check

```http
GET /health
```

Returns system health status and ML service connectivity.

#### Sentiment Analysis

```http
POST /api/sentiment/analyze
Content-Type: application/json

{
  "text": "I love this project!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sentiment": "Positive",
    "confidence": 0.86,
    "probabilities": {
      "Positive": 0.86,
      "Negative": 0.08,
      "Neutral": 0.06
    },
    "processingTime": "245ms"
  }
}
```

### ML Service API (Port 8000)

#### Health Check

```http
GET /health
```

#### Prediction

```http
POST /predict
Content-Type: application/json

{
  "text": "Your text here"
}
```

## 🔍 Troubleshooting

### Common Issues:

1. **Port Conflicts**

   - Kill existing processes: `taskkill /F /PID <process_id>` (Windows)
   - Or use different ports in configuration files

2. **ML Service Fails to Start**

   - Ensure you're in the `ml-service` directory when running `python app.py`
   - Check that all model files exist in `ml-service/models/`

3. **CORS Errors**

   - Verify backend `.env` has `CORS_ORIGIN=http://localhost:3000`
   - Ensure ML service allows requests from both backend and frontend

4. **Dependencies Issues**
   - Run `npm install` in both frontend and backend directories
   - Run `pip install -r requirements.txt` in ml-service directory

### Test the API directly:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test sentiment analysis
curl -X POST http://localhost:5000/api/sentiment/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this!"}'
```

## 🎨 UI Components

- **SentimentAnalyzer** - Main analysis component
- **TextInput** - Text input with validation
- **ResultDisplay** - Sentiment results visualization
- **LoadingSpinner** - Loading state indicator
- **ConfidenceBar** - Confidence score visualization

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```
PORT=5000
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

**Frontend (.env)**

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

**ML Service (.env)**

```
FLASK_PORT=8000
MODEL_PATH=./models/random_forest_sentiment_model.pkl
FLASK_ENV=development
```

## 🚀 Deployment

### Development

```bash
npm run dev        # Backend
npm start          # Frontend
python app.py      # ML Service
```

### Production

```bash
npm run build      # Build frontend
npm run start      # Start backend
python app.py      # Start ML service
```

## 📊 Model Information

- **Algorithm**: Random Forest Classifier
- **Accuracy**: 97.40%
- **F1-Score**: 0.97
- **Classes**: Positive, Negative, Neutral
- **Training Data**: 74,682 samples
- **Validation Data**: 1,000 samples
- **Features**: TF-IDF vectorization with text preprocessing
- **Model Size**: 347.11 MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Machine learning powered by scikit-learn
- UI components styled with modern CSS
- CORS and security best practices implemented

---

**Made with ❤️ for sentiment analysis**
#   S e n t i m e n t - I Q 
 
 
