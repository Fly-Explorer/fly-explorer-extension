import styled from 'styled-components'
import { DataItem } from '../DataItem'

export const CustomCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  margin-top: 8px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    background: linear-gradient(
      60deg,
      #ff6b6b,
      #4ecdc4,
      #45b8ac
    );
    border-radius: 12px;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  &.selected {
    background: rgba(69, 184, 172, 0.08);
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(69, 184, 172, 0.2);

    &::before {
      padding: 3px;
      background: linear-gradient(
        60deg,
        #45b8ac,
        #4ecdc4,
        #45b8ac
      );
    }

    ${DataItem} {
      background: rgba(69, 184, 172, 0.06);
      border-left: 3px solid #45b8ac;
    }

    ${DataItem} .label {
      color: #45b8ac;
      font-weight: 600;
    }

    ${DataItem} .value {
      border-color: rgba(69, 184, 172, 0.2);
    }

    ${DataItem}:hover {
      background: rgba(69, 184, 172, 0.1);
    }
  }
`
