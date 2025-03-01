import React from 'react';
import './styles.css';
import useStorage from '../../hooks/useStorage';

interface FinishButtonProps {
  onClick: () => void;
  disabled?: boolean;
  spacerHeight?: number;
}

export const FinishButton: React.FC<FinishButtonProps> = ({
  onClick,
  disabled = false,
  spacerHeight = 0
}) => {
  const { value: selectedTopic } = useStorage<string>('selectedTopic', '');
  return (
    <>
      <button 
        onClick={onClick} 
        className="finish-button animate-slide-up" 
        style={{ 
          animationDelay: '0.8s',
          marginTop: 0
        }}
        disabled={disabled || !selectedTopic}
      >
        <span>Finish</span>
      </button>
    </>
  );
};

export default FinishButton; 