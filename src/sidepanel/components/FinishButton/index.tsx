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
  spacerHeight = 0
}) => {
  return (
    <>
      <button 
        onClick={onClick} 
        className="finish-button animate-slide-up" 
        style={{ 
          animationDelay: '0.8s',
          marginTop: 0
        }}
      >
        <span>Finish</span>
      </button>
    </>
  );
};

export default FinishButton; 