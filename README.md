```markdown
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

- "I absolutely love this project! It's amazing!"
- "This is the best day ever! Everything is perfect!"

### 😠 Negative Sentiment Examples:

- "This is absolutely terrible and disappointing!"
- "I hate this! It's completely useless!"

### 😐 Neutral Sentiment Examples:

- "The meeting is scheduled for 3 PM today."
- "The weather forecast shows rain tomorrow."

### 🎯 Fun Test Examples:

- "Pizza is life! 🍕" (Expected: Positive)
- "Monday mornings are the worst" (Expected: Negative)

## 🎯 Features

- ✨ **Real-time Sentiment Analysis**
- 🎨 **Modern UI**
- 🚀 **Fast API**
- 🤖 **High Accuracy ML**
- 📱 **Mobile Responsive**
- 🔄 **Real-time Updates**
- 📊 **Confidence Scores**

## 🛠️ Technology Stack

### Frontend

- **React.js**
- **Axios**
- **CSS3**

### Backend

- **Node.js**
- **Express.js**

### ML Service

- **Python**
- **Flask**
- **scikit-learn**

## 📡 API Endpoints

### Backend API (Port 5000)

#### Health Check

```http
GET /health
```

#### Sentiment Analysis

```http
POST /api/sentiment/analyze
Content-Type: application/json

{
  "text": "I love this project!"
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
2. **ML Service Fails to Start**
3. **CORS Errors**
4. **Dependencies Issues**

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

- **SentimentAnalyzer**
- **TextInput**
- **ResultDisplay**
- **LoadingSpinner**
- **ConfidenceBar**

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

---

**Made with ❤️ for sentiment analysis**
```
