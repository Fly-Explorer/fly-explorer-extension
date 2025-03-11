import React from 'react';
import { Button, ButtonProps } from 'antd';
import styled, { keyframes } from 'styled-components';

// Animation cho hiệu ứng loading
const loadingAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled component cho AnimatedButton
const StyledButton = styled(Button)<{ $isLoading?: boolean }>`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(78, 205, 196, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.$isLoading && `
    background-size: 200% 200% !important;
    animation: ${loadingAnimation} 2s ease infinite !important;
  `}
`;

// Props cho AnimatedButton
export interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean;
}

// Component AnimatedButton
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  loading = false, 
  ...props 
}) => {
  // Đảm bảo loading luôn là boolean
  const isLoading = loading === true;
  
  return (
    <StyledButton className="animated-button" $isLoading={isLoading} loading={isLoading} {...props}>
      {children}
    </StyledButton>
  );
};

export default AnimatedButton; 