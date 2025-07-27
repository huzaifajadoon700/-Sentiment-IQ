import React, { useCallback, KeyboardEvent } from 'react';
import { TextInputProps } from '../types';

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Enter your text here...",
  maxLength = 5000
}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  }, [isLoading, value, onSubmit]);

  const getCharacterCountColor = useCallback(() => {
    const length = value.length;
    const percentage = (length / maxLength) * 100;
    
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return '';
  }, [value.length, maxLength]);

  const isOverLimit = value.length > maxLength;

  return (
    <div className="text-input-container">
      <textarea
        className={`text-input ${isOverLimit ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={4}
        style={{ resize: 'vertical', minHeight: '120px' }}
      />
      
      <div className="input-footer">
        <div className="input-hints">
          <span className="hint">
            <i className="fas fa-keyboard" />
            Press Ctrl+Enter to analyze
          </span>
        </div>
        
        <div className={`character-count ${getCharacterCountColor()}`}>
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          {isOverLimit && (
            <span className="over-limit-warning">
              <i className="fas fa-exclamation-triangle" />
              Text too long
            </span>
          )}
        </div>
      </div>
      
      {value.length > 0 && (
        <div className="input-stats">
          <div className="stat-item">
            <i className="fas fa-align-left" />
            <span>{value.split(/\s+/).filter(word => word.length > 0).length} words</span>
          </div>
          <div className="stat-item">
            <i className="fas fa-paragraph" />
            <span>{value.split(/\n\s*\n/).filter(para => para.trim().length > 0).length} paragraphs</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextInput;
