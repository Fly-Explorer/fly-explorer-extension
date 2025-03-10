import React from 'react';
import { Flex, Typography, Button, Tooltip } from 'antd';
import { AnimatedButton } from '../../../components/AnimatedButton';
import { CustomCard } from '../../../components/CustomCard';
import { TreeTraverser } from '../../../components/tree-traverser';
import {
  StickyContainer,
  ScrollableContent,
  StyledTreeSelect,
} from '../../../components/CollectedData/styles';
import { useContextTree } from '../hooks/useContextTree';
import { useUpload } from '../hooks/useUpload';
import { useDataStore } from '../store/useDataStore';

export const CollectedDataTab: React.FC = () => {
  const {
    contextTree,
    contextTypes,
    contextTypesTree,
    handleContextTypeChange,
    openItemDetails,
    isSelected,
    toggleSelectItem,
  } = useContextTree();

  // import data
  const { selectedData } = useDataStore();
  const { loadingUpload, handleUploadClick } = useUpload();

  if (!contextTree) {
    return (
      <Typography.Text style={{ textAlign: 'center' }}>No context tree</Typography.Text>
    );
  }

  return (
    <Flex vertical gap="small">
      <StickyContainer>
        <AnimatedButton
          block
          type="primary"
          onClick={handleUploadClick}
          style={{
            background: 'linear-gradient(135deg, #4ecdc4, #45b8ac)',
            backgroundSize: '100% 100%',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            height: '38px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.25)',
            marginBottom: '8px',
            fontSize: '14px',
          }}
        >
          {loadingUpload
            ? 'Uploading...'
            : selectedData.length > 0
              ? `Upload ${selectedData.length} item${selectedData.length > 1 ? 's' : ''}`
              : 'Upload'}
        </AnimatedButton>

        <StyledTreeSelect
          style={{ width: '100%', marginBottom: '8px' }}
          value={contextTypes}
          dropdownStyle={{
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: '8px',
            padding: '6px',
          }}
          treeData={contextTypesTree}
          placeholder="Filter by type..."
          treeDefaultExpandAll
          onChange={handleContextTypeChange}
          multiple
        />
      </StickyContainer>

      <ScrollableContent>
        <TreeTraverser
          node={contextTree}
          component={({ node }) => {
            if (!contextTypes.includes(node.contextType) && contextTypes.length > 0)
              return null;
            
            const nodeIsSelected = isSelected(node.id!);

            // Lấy text từ parsedContext nếu có
            const mainText =
              node.parsedContext.text ||
              node.parsedContext.title ||
              node.parsedContext.name ||
              '';

            return (
              <CustomCard
                onClick={() => toggleSelectItem(node)}
                className={nodeIsSelected ? 'selected' : ''}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  marginBottom: '8px',
                  transition: 'all 0.2s ease',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  boxShadow: nodeIsSelected ? '0 2px 8px rgba(78, 205, 196, 0.15)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!nodeIsSelected) {
                    e.currentTarget.style.boxShadow = 'none';
                  } else {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(78, 205, 196, 0.15)';
                  }
                }}
              >
                <Flex justify="space-between" align="center" style={{ marginBottom: '6px' }}>
                  <Typography.Text
                    strong
                    style={{
                      color: nodeIsSelected ? '#45b8ac' : 'inherit',
                      transition: 'color 0.3s ease',
                      fontSize: '13px',
                    }}
                  >
                    {node.contextType}
                  </Typography.Text>
                  <Button
                    size="small"
                    className={nodeIsSelected ? 'selected' : ''}
                    style={{
                      padding: '2px 8px',
                      fontSize: '12px',
                      height: 'auto',
                      borderRadius: '4px',
                      background: nodeIsSelected ? 'linear-gradient(135deg, #45b8ac, #4ecdc4)' : undefined,
                      border: nodeIsSelected ? 'none' : undefined,
                      color: nodeIsSelected ? 'white' : undefined,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(node);
                    }}
                  >
                    {nodeIsSelected ? 'Selected' : 'Select'}
                  </Button>
                </Flex>

                {mainText && (
                  <Typography.Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{
                      fontSize: '12px',
                      margin: '0 0 6px 0',
                      color: '#666',
                    }}
                  >
                    {mainText}
                  </Typography.Paragraph>
                )}

                <Flex justify="flex-end">
                  <Tooltip title="View details">
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => openItemDetails(node, e)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '12px',
                        color: '#2f302f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ marginRight: '4px' }}>Details</span>
                      <span>⋯</span>
                    </Button>
                  </Tooltip>
                </Flex>
              </CustomCard>
            );
          }}
        />
      </ScrollableContent>
    </Flex>
  );
}; 