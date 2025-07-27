"""
Prediction service for sentiment analysis
"""

import time
import logging
import sys
import os
from typing import List, Dict, Any, Optional

# Add the parent directory to the path to import data_preprocessing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_preprocessing import TwitterDataPreprocessor

logger = logging.getLogger(__name__)

class PredictionService:
    """Handles sentiment prediction logic"""
    
    def __init__(self, model_loader, config):
        self.model_loader = model_loader
        self.config = config
        self.preprocessor = TwitterDataPreprocessor()
        self.prediction_cache = {} if config.ENABLE_CACHING else None
        self.cache_hits = 0
        self.cache_misses = 0
    
    def predict_single(self, text: str, include_probabilities: bool = True, 
                      model_type: str = 'random_forest') -> Dict[str, Any]:
        """
        Predict sentiment for a single text
        
        Args:
            text: Input text to analyze
            include_probabilities: Whether to include prediction probabilities
            model_type: Type of model to use (currently only supports loaded model)
            
        Returns:
            Dictionary with prediction results
        """
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = self._get_cache_key(text, include_probabilities)
            if self.prediction_cache and cache_key in self.prediction_cache:
                self.cache_hits += 1
                cached_result = self.prediction_cache[cache_key].copy()
                cached_result['from_cache'] = True
                cached_result['processing_time_ms'] = round((time.time() - start_time) * 1000, 2)
                return cached_result
            
            self.cache_misses += 1
            
            # Preprocess text
            processed_text = self.preprocessor.preprocess_text(text)
            
            if not processed_text.strip():
                # Handle empty text after preprocessing
                result = {
                    'sentiment': 'Neutral',
                    'confidence': 0.5,
                    'processing_time_ms': round((time.time() - start_time) * 1000, 2),
                    'from_cache': False
                }
                
                if include_probabilities:
                    result['probabilities'] = {
                        'Negative': 0.33,
                        'Neutral': 0.34,
                        'Positive': 0.33
                    }
                
                return result
            
            # Get models
            model = self.model_loader.get_model()
            vectorizer = self.model_loader.get_vectorizer()
            label_encoder = self.model_loader.get_label_encoder()
            
            # Vectorize text
            text_vector = vectorizer.transform([processed_text])
            
            # Make prediction
            prediction = model.predict(text_vector)[0]
            sentiment = label_encoder.inverse_transform([prediction])[0]
            
            # Get confidence score
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(text_vector)[0]
                confidence = float(max(probabilities))
                
                if include_probabilities:
                    prob_dict = {}
                    for i, class_name in enumerate(label_encoder.classes_):
                        prob_dict[class_name] = round(float(probabilities[i]), 3)
            else:
                confidence = 1.0
                prob_dict = {cls: 0.0 for cls in label_encoder.classes_}
                prob_dict[sentiment] = 1.0
            
            # Prepare result
            result = {
                'sentiment': sentiment,
                'confidence': round(confidence, 3),
                'processing_time_ms': round((time.time() - start_time) * 1000, 2),
                'from_cache': False
            }
            
            if include_probabilities:
                result['probabilities'] = prob_dict
            
            # Cache result
            if self.prediction_cache and len(self.prediction_cache) < self.config.CACHE_SIZE:
                self.prediction_cache[cache_key] = result.copy()
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Prediction error for text '{text[:50]}...': {str(e)}")
            raise e
    
    def predict_batch(self, texts: List[str], include_probabilities: bool = True,
                     model_type: str = 'random_forest') -> List[Dict[str, Any]]:
        """
        Predict sentiment for multiple texts
        
        Args:
            texts: List of input texts to analyze
            include_probabilities: Whether to include prediction probabilities
            model_type: Type of model to use
            
        Returns:
            List of prediction results
        """
        start_time = time.time()
        
        try:
            results = []
            
            # Process each text
            for i, text in enumerate(texts):
                try:
                    result = self.predict_single(text, include_probabilities, model_type)
                    result['index'] = i
                    results.append(result)
                except Exception as e:
                    logger.error(f"❌ Error processing text {i}: {str(e)}")
                    # Add error result
                    results.append({
                        'index': i,
                        'sentiment': 'Neutral',
                        'confidence': 0.0,
                        'error': str(e),
                        'processing_time_ms': 0,
                        'from_cache': False
                    })
            
            total_time = round((time.time() - start_time) * 1000, 2)
            logger.info(f"✅ Batch prediction completed: {len(results)} texts in {total_time}ms")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Batch prediction error: {str(e)}")
            raise e
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded and ready"""
        return self.model_loader.is_loaded()
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if not self.is_model_loaded():
            return {'status': 'not_loaded'}
        
        info = self.model_loader.get_model_info()
        
        # Add prediction service stats
        info['prediction_stats'] = {
            'cache_enabled': self.prediction_cache is not None,
            'cache_size': len(self.prediction_cache) if self.prediction_cache else 0,
            'cache_hits': self.cache_hits,
            'cache_misses': self.cache_misses,
            'cache_hit_rate': (
                round(self.cache_hits / max(self.cache_hits + self.cache_misses, 1) * 100, 2)
            )
        }
        
        return info
    
    def get_available_models(self) -> Dict[str, Any]:
        """Get information about available models"""
        return self.model_loader.get_available_models()
    
    def clear_cache(self) -> Dict[str, Any]:
        """Clear prediction cache"""
        if self.prediction_cache:
            cache_size = len(self.prediction_cache)
            self.prediction_cache.clear()
            self.cache_hits = 0
            self.cache_misses = 0
            
            return {
                'success': True,
                'message': f'Cache cleared. Removed {cache_size} entries.'
            }
        else:
            return {
                'success': False,
                'message': 'Cache is not enabled.'
            }
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.prediction_cache:
            return {'cache_enabled': False}
        
        return {
            'cache_enabled': True,
            'cache_size': len(self.prediction_cache),
            'max_cache_size': self.config.CACHE_SIZE,
            'cache_hits': self.cache_hits,
            'cache_misses': self.cache_misses,
            'cache_hit_rate': round(
                self.cache_hits / max(self.cache_hits + self.cache_misses, 1) * 100, 2
            ),
            'cache_usage_percent': round(
                len(self.prediction_cache) / self.config.CACHE_SIZE * 100, 2
            )
        }
    
    def _get_cache_key(self, text: str, include_probabilities: bool) -> str:
        """Generate cache key for text and options"""
        # Simple hash-based cache key
        import hashlib
        key_string = f"{text}_{include_probabilities}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def validate_text_input(self, text: str) -> Dict[str, Any]:
        """Validate text input"""
        if not isinstance(text, str):
            return {'valid': False, 'error': 'Text must be a string'}
        
        if not text.strip():
            return {'valid': False, 'error': 'Text cannot be empty'}
        
        if len(text) > self.config.MAX_TEXT_LENGTH:
            return {
                'valid': False, 
                'error': f'Text too long. Maximum length is {self.config.MAX_TEXT_LENGTH} characters'
            }
        
        return {'valid': True}
    
    def get_preprocessing_info(self, text: str) -> Dict[str, Any]:
        """Get information about text preprocessing"""
        original_length = len(text)
        processed_text = self.preprocessor.preprocess_text(text)
        processed_length = len(processed_text)
        
        return {
            'original_text': text,
            'processed_text': processed_text,
            'original_length': original_length,
            'processed_length': processed_length,
            'reduction_percent': round(
                (original_length - processed_length) / max(original_length, 1) * 100, 2
            )
        }
