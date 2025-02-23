import styled from 'styled-components'

export const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    transform: scale(1.02);
  }

  .label {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  }

  .value {
    font-size: 14px;
    color: #2c3e50;
    word-break: break-word;
    line-height: 1.4;
    font-weight: 400;
    background: white;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
  }
`
