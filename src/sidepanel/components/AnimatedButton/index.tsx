import styled from 'styled-components'
import { Button } from 'antd'

export const AnimatedButton = styled(Button)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(1px);
  }
`
