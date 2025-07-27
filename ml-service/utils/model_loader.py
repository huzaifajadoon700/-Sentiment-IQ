"""
Model loading utilities for ML service
"""

import joblib
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ModelLoader:
    """Handles loading and managing ML models"""
    
    def __init__(self, config):
        self.config = config
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.model_info = {}
        self.loaded_at = None
    
    def load_models(self):
        """Load all required models"""
        try:
            logger.info("📦 Loading ML models...")
            
            # Load main model
            logger.info(f"Loading model from: {self.config.MODEL_PATH}")
            self.model = joblib.load(self.config.MODEL_PATH)
            
            # Load vectorizer
            logger.info(f"Loading vectorizer from: {self.config.VECTORIZER_PATH}")
            self.vectorizer = joblib.load(self.config.VECTORIZER_PATH)
            
            # Load label encoder
            logger.info(f"Loading label encoder from: {self.config.LABEL_ENCODER_PATH}")
            self.label_encoder = joblib.load(self.config.LABEL_ENCODER_PATH)
            
            # Store model information
            self.model_info = {
                'model_type': type(self.model).__name__,
                'model_path': self.config.MODEL_PATH,
                'vectorizer_type': type(self.vectorizer).__name__,
                'label_classes': list(self.label_encoder.classes_),
                'loaded_at': datetime.now().isoformat(),
                'model_size_mb': self._get_file_size_mb(self.config.MODEL_PATH),
                'vectorizer_size_mb': self._get_file_size_mb(self.config.VECTORIZER_PATH),
                'label_encoder_size_mb': self._get_file_size_mb(self.config.LABEL_ENCODER_PATH)
            }
            
            self.loaded_at = datetime.now()
            
            logger.info("✅ All models loaded successfully")
            logger.info(f"   Model Type: {self.model_info['model_type']}")
            logger.info(f"   Classes: {self.model_info['label_classes']}")
            logger.info(f"   Total Size: {sum([
                self.model_info['model_size_mb'],
                self.model_info['vectorizer_size_mb'],
                self.model_info['label_encoder_size_mb']
            ]):.2f} MB")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load models: {str(e)}")
            raise e
    
    def is_loaded(self):
        """Check if all models are loaded"""
        return all([
            self.model is not None,
            self.vectorizer is not None,
            self.label_encoder is not None
        ])
    
    def get_model(self):
        """Get the loaded model"""
        if not self.is_loaded():
            raise RuntimeError("Models not loaded. Call load_models() first.")
        return self.model
    
    def get_vectorizer(self):
        """Get the loaded vectorizer"""
        if not self.is_loaded():
            raise RuntimeError("Models not loaded. Call load_models() first.")
        return self.vectorizer
    
    def get_label_encoder(self):
        """Get the loaded label encoder"""
        if not self.is_loaded():
            raise RuntimeError("Models not loaded. Call load_models() first.")
        return self.label_encoder
    
    def get_model_info(self):
        """Get model information"""
        if not self.is_loaded():
            return {'status': 'not_loaded'}
        
        info = self.model_info.copy()
        info['uptime_seconds'] = (datetime.now() - self.loaded_at).total_seconds()
        return info
    
    def get_available_models(self):
        """Get information about available models"""
        available_models = []
        
        # Check for different model types in the models directory
        models_dir = os.path.dirname(self.config.MODEL_PATH)
        
        if os.path.exists(models_dir):
            for filename in os.listdir(models_dir):
                if filename.endswith('_sentiment_model.pkl'):
                    model_name = filename.replace('_sentiment_model.pkl', '')
                    model_path = os.path.join(models_dir, filename)
                    
                    available_models.append({
                        'name': model_name,
                        'path': model_path,
                        'size_mb': self._get_file_size_mb(model_path),
                        'is_current': model_path == self.config.MODEL_PATH
                    })
        
        return {
            'current_model': self.model_info if self.is_loaded() else None,
            'available_models': available_models,
            'total_models': len(available_models)
        }
    
    def reload_models(self):
        """Reload all models"""
        logger.info("🔄 Reloading models...")
        
        # Clear current models
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.model_info = {}
        self.loaded_at = None
        
        # Reload models
        return self.load_models()
    
    def _get_file_size_mb(self, file_path):
        """Get file size in MB"""
        try:
            if os.path.exists(file_path):
                size_bytes = os.path.getsize(file_path)
                return round(size_bytes / (1024 * 1024), 2)
            return 0
        except Exception:
            return 0
    
    def validate_model_files(self):
        """Validate that all required model files exist"""
        model_paths = self.config.get_model_paths()
        missing_files = []
        
        for name, path in model_paths.items():
            if not os.path.exists(path):
                missing_files.append(f"{name}: {path}")
        
        if missing_files:
            raise FileNotFoundError(f"Missing model files: {', '.join(missing_files)}")
        
        return True
    
    def get_model_performance_info(self):
        """Get model performance information (if available)"""
        # This could be extended to include performance metrics
        # stored during training
        return {
            'model_type': self.model_info.get('model_type', 'Unknown'),
            'classes': self.model_info.get('label_classes', []),
            'training_info': {
                'note': 'Performance metrics would be loaded from training metadata'
            }
        }
