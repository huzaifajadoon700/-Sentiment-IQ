"""
Configuration management for ML service
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class for ML service"""
    
    def __init__(self):
        # Flask configuration
        self.FLASK_PORT = int(os.getenv('FLASK_PORT', 8000))
        self.FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
        self.FLASK_ENV = os.getenv('FLASK_ENV', 'development')
        self.FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        
        # Model configuration
        self.MODEL_PATH = os.getenv('MODEL_PATH', './models/random_forest_sentiment_model.pkl')
        self.VECTORIZER_PATH = os.getenv('VECTORIZER_PATH', './models/random_forest_sentiment_model_vectorizer.pkl')
        self.LABEL_ENCODER_PATH = os.getenv('LABEL_ENCODER_PATH', './models/random_forest_sentiment_model_label_encoder.pkl')
        
        # API configuration
        self.MAX_TEXT_LENGTH = int(os.getenv('MAX_TEXT_LENGTH', 5000))
        self.MAX_BATCH_SIZE = int(os.getenv('MAX_BATCH_SIZE', 100))
        self.REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
        
        # Logging configuration
        self.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
        self.LOG_FILE = os.getenv('LOG_FILE', './logs/ml_service.log')
        
        # Performance configuration
        self.ENABLE_CACHING = os.getenv('ENABLE_CACHING', 'True').lower() == 'true'
        self.CACHE_SIZE = int(os.getenv('CACHE_SIZE', 1000))
        
        # Validate configuration
        self._validate_config()
    
    def _validate_config(self):
        """Validate configuration values"""
        # Check if model files exist
        model_files = [self.MODEL_PATH, self.VECTORIZER_PATH, self.LABEL_ENCODER_PATH]
        for file_path in model_files:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Model file not found: {file_path}")
        
        # Validate numeric values
        if self.FLASK_PORT < 1 or self.FLASK_PORT > 65535:
            raise ValueError(f"Invalid FLASK_PORT: {self.FLASK_PORT}")
        
        if self.MAX_TEXT_LENGTH < 1:
            raise ValueError(f"Invalid MAX_TEXT_LENGTH: {self.MAX_TEXT_LENGTH}")
        
        if self.MAX_BATCH_SIZE < 1:
            raise ValueError(f"Invalid MAX_BATCH_SIZE: {self.MAX_BATCH_SIZE}")
    
    def get_model_paths(self):
        """Get all model file paths"""
        return {
            'model': self.MODEL_PATH,
            'vectorizer': self.VECTORIZER_PATH,
            'label_encoder': self.LABEL_ENCODER_PATH
        }
    
    def print_config(self):
        """Print configuration summary"""
        print("📋 ML Service Configuration:")
        print(f"   Flask Host: {self.FLASK_HOST}")
        print(f"   Flask Port: {self.FLASK_PORT}")
        print(f"   Environment: {self.FLASK_ENV}")
        print(f"   Debug Mode: {self.FLASK_DEBUG}")
        print(f"   Model Path: {self.MODEL_PATH}")
        print(f"   Max Text Length: {self.MAX_TEXT_LENGTH}")
        print(f"   Max Batch Size: {self.MAX_BATCH_SIZE}")
        print(f"   Caching Enabled: {self.ENABLE_CACHING}")
        print(f"   Log Level: {self.LOG_LEVEL}")
