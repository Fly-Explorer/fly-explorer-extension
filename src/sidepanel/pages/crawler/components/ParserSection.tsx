import React from 'react';
import { Space, Typography, Button } from 'antd';
import { ParserHeader } from '../../../components/CollectedData/styles';
import CodeEditor from '../../../components/CodeEditor';
import { useParser } from '../hooks/useParser';

export const ParserSection: React.FC = () => {
  const {
    parsers,
    isCodeEditorOpened,
    isLocalParserSaving,
    saveLocalParserConfig,
    toggleCodeEditor,
    getParserName,
  } = useParser();

  if (!parsers?.length) {
    return null;
  }

  return (
    <Space direction="vertical" size="small" style={{ display: 'flex' }}>
      <ParserHeader style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography.Title level={5} style={{ margin: '0' }}>
          {getParserName()}
        </Typography.Title>
        <Button
          type="link"
          style={{
            color: '#4ecdc4',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            fontSize: '13px',
          }}
          onClick={toggleCodeEditor}
        >
          {isCodeEditorOpened ? 'Hide parser' : 'Edit scheme'}
        </Button>
      </ParserHeader>

      {isCodeEditorOpened && (
        <CodeEditor
          parserConfig={parsers[0]}
          saveParserConfig={saveLocalParserConfig}
          isLocalParserSaving={isLocalParserSaving}
        />
      )}
    </Space>
  );
}; 