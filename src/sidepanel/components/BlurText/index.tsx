import React, { useEffect, useState } from 'react';
import './index.css';

interface BlurTextProps {
  text: string;
  className?: string;
}

export const BlurText: React.FC<BlurTextProps> = ({ text, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure the animation starts after component mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <span className={`blur-text gradient-text ${isVisible ? 'visible' : ''} ${className}`}>
      {text}
    </span>
  );
};
