"""
Flask application for Sentiment Analysis ML Service
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import psutil
import time
from datetime import datetime

# Load environment variables
load_dotenv()

# Import services
try:
    from services.prediction_service import PredictionService
    from utils.model_loader import ModelLoader
    from utils.config import Config
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all required files are in place")
    exit(1)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize services
config = Config()
model_loader = ModelLoader(config)
prediction_service = PredictionService(model_loader, config)

# Application statistics
app_stats = {
    'start_time': datetime.now(),
    'total_requests': 0,
    'successful_predictions': 0,
    'failed_predictions': 0,
    'average_response_time': 0
}

@app.before_request
def before_request():
    """Log request details and update stats"""
    app_stats['total_requests'] += 1
    request.start_time = time.time()
    
    logger.info(f"📝 {request.method} {request.path} from {request.remote_addr}")

@app.after_request
def after_request(response):
    """Log response details and update stats"""
    if hasattr(request, 'start_time'):
        response_time = (time.time() - request.start_time) * 1000
        
        # Update average response time
        total_requests = app_stats['total_requests']
        current_avg = app_stats['average_response_time']
        app_stats['average_response_time'] = (
            (current_avg * (total_requests - 1) + response_time) / total_requests
        )
        
        logger.info(f"✅ Response: {response.status_code} ({response_time:.2f}ms)")
    
    return response

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'service': 'Sentiment Analysis ML Service',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': prediction_service.is_model_loaded(),
        'endpoints': {
            'predict': '/predict',
            'batch_predict': '/predict/batch',
            'health': '/health',
            'models': '/models',
            'stats': '/stats'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Single text sentiment prediction"""
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text']
        
        # Validate text length
        if len(text) > config.MAX_TEXT_LENGTH:
            return jsonify({
                'error': f'Text too long. Maximum length is {config.MAX_TEXT_LENGTH} characters'
            }), 400
        
        if not text.strip():
            return jsonify({
                'error': 'Text cannot be empty'
            }), 400
        
        # Get options
        include_probabilities = data.get('include_probabilities', True)
        model_type = data.get('model', 'random_forest')
        
        # Make prediction
        result = prediction_service.predict_single(
            text, 
            include_probabilities=include_probabilities,
            model_type=model_type
        )
        
        app_stats['successful_predictions'] += 1
        
        return jsonify({
            'success': True,
            'sentiment': result['sentiment'],
            'confidence': result['confidence'],
            'probabilities': result.get('probabilities'),
            'processing_time_ms': result['processing_time_ms'],
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app_stats['failed_predictions'] += 1
        logger.error(f"❌ Prediction error: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Batch text sentiment prediction"""
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if 'texts' not in data:
            return jsonify({
                'error': 'Missing required field: texts'
            }), 400
        
        texts = data['texts']
        
        # Validate texts array
        if not isinstance(texts, list):
            return jsonify({
                'error': 'texts must be an array'
            }), 400
        
        if len(texts) == 0:
            return jsonify({
                'error': 'texts array cannot be empty'
            }), 400
        
        if len(texts) > config.MAX_BATCH_SIZE:
            return jsonify({
                'error': f'Batch size too large. Maximum is {config.MAX_BATCH_SIZE} texts'
            }), 400
        
        # Validate each text
        for i, text in enumerate(texts):
            if not isinstance(text, str):
                return jsonify({
                    'error': f'Text at index {i} must be a string'
                }), 400
            
            if len(text) > config.MAX_TEXT_LENGTH:
                return jsonify({
                    'error': f'Text at index {i} too long. Maximum length is {config.MAX_TEXT_LENGTH} characters'
                }), 400
        
        # Get options
        include_probabilities = data.get('include_probabilities', True)
        model_type = data.get('model', 'random_forest')
        
        # Make predictions
        results = prediction_service.predict_batch(
            texts,
            include_probabilities=include_probabilities,
            model_type=model_type
        )
        
        app_stats['successful_predictions'] += len(texts)
        
        return jsonify({
            'success': True,
            'predictions': results,
            'count': len(results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app_stats['failed_predictions'] += len(data.get('texts', []))
        logger.error(f"❌ Batch prediction error: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': 'Batch prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        model_status = prediction_service.is_model_loaded()
        
        health_data = {
            'status': 'healthy' if model_status else 'unhealthy',
            'model_loaded': model_status,
            'uptime_seconds': (datetime.now() - app_stats['start_time']).total_seconds(),
            'timestamp': datetime.now().isoformat()
        }
        
        status_code = 200 if model_status else 503
        return jsonify(health_data), status_code
        
    except Exception as e:
        logger.error(f"❌ Health check error: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 503

@app.route('/health/detailed', methods=['GET'])
def health_detailed():
    """Detailed health check with system information"""
    try:
        model_status = prediction_service.is_model_loaded()
        
        # Get system information
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        
        health_data = {
            'status': 'healthy' if model_status else 'unhealthy',
            'model_loaded': model_status,
            'uptime_seconds': (datetime.now() - app_stats['start_time']).total_seconds(),
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_mb': memory.available // (1024 * 1024),
                'memory_total_mb': memory.total // (1024 * 1024)
            },
            'models': prediction_service.get_model_info(),
            'timestamp': datetime.now().isoformat()
        }
        
        status_code = 200 if model_status else 503
        return jsonify(health_data), status_code
        
    except Exception as e:
        logger.error(f"❌ Detailed health check error: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 503

@app.route('/models', methods=['GET'])
def models():
    """Get available models information"""
    try:
        models_info = prediction_service.get_available_models()
        
        return jsonify({
            'success': True,
            'models': models_info,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Models info error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/stats', methods=['GET'])
def stats():
    """Get service statistics"""
    try:
        uptime = (datetime.now() - app_stats['start_time']).total_seconds()
        
        stats_data = {
            'uptime_seconds': uptime,
            'total_requests': app_stats['total_requests'],
            'successful_predictions': app_stats['successful_predictions'],
            'failed_predictions': app_stats['failed_predictions'],
            'success_rate': (
                app_stats['successful_predictions'] / max(app_stats['total_requests'], 1) * 100
            ),
            'average_response_time_ms': round(app_stats['average_response_time'], 2),
            'model_loaded': prediction_service.is_model_loaded(),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'stats': stats_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Stats error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'message': f'The requested endpoint does not exist',
        'available_endpoints': [
            'GET /',
            'POST /predict',
            'POST /predict/batch',
            'GET /health',
            'GET /health/detailed',
            'GET /models',
            'GET /stats'
        ],
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"❌ Internal server error: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    # Load models on startup
    logger.info("🚀 Starting ML Service...")

    try:
        model_loader.load_models()
        logger.info("✅ Models loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to load models: {str(e)}")
        exit(1)

    # Start Flask app
    port = int(os.getenv('FLASK_PORT', 8000))
    host = os.getenv('FLASK_HOST', '127.0.0.1')  # Changed to localhost for development
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    logger.info(f"🌐 Starting server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
