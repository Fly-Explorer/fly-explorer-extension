import { Button, Flex, TreeSelect, Typography, Layout as AntdLayout } from 'antd'
import styled from 'styled-components'
import { AnimatedButton } from '../AnimatedButton'
import { CustomCard } from '../CustomCard'
import { DataItem } from '../DataItem'


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 8px;
  margin-top: 8px;
`

const ActionButtons = styled(Flex)`
  gap: 12px;
  margin: 8px 0;

  ${AnimatedButton} {
    flex: 1;
    height: 40px;
    border-radius: 8px;
    font-weight: 500;

    &:first-child {
      background: linear-gradient(135deg, #4ecdc4, #45b8ac);
      border: none;
      color: white;
    }

    &:last-child {
      background: linear-gradient(135deg, #ff6b6b, #ff8585);
      border: none;
      color: white;
    }
  }
`

const ParserHeader = styled(Flex)`
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`

const StyledLayout = styled(AntdLayout)`
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  min-height: 100vh;
`

const SelectButton = styled(Button)`
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &.selected {
    background: linear-gradient(135deg, #45b8ac, #4ecdc4);
    border: none;
    color: white;
    font-weight: 600;

    &:hover {
      background: linear-gradient(135deg, #4ecdc4, #45b8ac);
      transform: translateY(-1px);
    }
  }

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

  &:hover::before {
    width: 300px;
    height: 300px;
  }
`

const SuccessCard = styled(CustomCard)`
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(168, 85, 247, 0.08));
  animation: slideDown 0.5s ease-out, pulse 2s ease-in-out infinite;
  border: none;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.15);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 8px 32px rgba(147, 51, 234, 0.15);
    }
    70% {
      box-shadow: 0 12px 40px rgba(147, 51, 234, 0.3);
    }
    100% {
      box-shadow: 0 8px 32px rgba(147, 51, 234, 0.15);
    }
  }

  &::before {
    padding: 2px;
    background: linear-gradient(
      60deg,
      #9333ea,
      #a855f7,
      #9333ea
    );
  }

  ${DataItem} {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(147, 51, 234, 0.2);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);

    .label {
      color: #9333ea;
      font-weight: 600;
      font-size: 11px;
    }

    .value {
      border: none;
      background: transparent;
      color: #1e293b;
      font-family: 'Monaco', monospace;
      font-size: 13px;
    }

    &:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 1);
      border-color: rgba(147, 51, 234, 0.4);
    }
  }

  &:hover {
    transform: none;
    box-shadow: 0 12px 40px rgba(147, 51, 234, 0.2);
  }
`

const StickyContainer = styled.div`
  position: sticky;
  top: 16px;
  z-index: 10;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  margin-bottom: 20px;
`

const ScrollableContent = styled.div`
  overflow-y: auto;
  height: calc(100vh - 280px);
  padding: 0 4px;
  margin-right: -4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(78, 205, 196, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(78, 205, 196, 0.5);
    }
  }
`

const StyledTreeSelect = styled(TreeSelect)`
  .ant-select-selector {
    border-radius: 10px !important;
    border: 1px solid rgba(78, 205, 196, 0.2) !important;
    background: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(78, 205, 196, 0.4) !important;
      background: white !important;
    }
  }

  &.ant-select-focused .ant-select-selector {
    border-color: #4ecdc4 !important;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2) !important;
  }
`

const PageHeader = styled(Typography.Title)`
  &.ant-typography {
    font-size: 24px;
    background: linear-gradient(135deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 24px !important;
  }
`

export { Grid, ActionButtons, ParserHeader, StyledLayout, SelectButton, SuccessCard, StickyContainer, ScrollableContent, StyledTreeSelect, PageHeader }
