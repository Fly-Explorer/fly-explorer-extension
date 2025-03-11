import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { Grid } from '../../../components/CollectedData/styles';
import { DataItem } from '../../../components/DataItem';
import { ClonedContextNode } from '../../../../common/types';
import { useDataStore } from '../store/useDataStore';

interface ItemDetailsModalProps {
  visible: boolean;
  currentItem: ClonedContextNode | null;
  onClose: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  visible,
  currentItem,
  onClose,
}) => {
  const { isSelected, toggleItem } = useDataStore();
  
  if (!currentItem) return null;

  const nodeIsSelected = currentItem.id ? isSelected(currentItem.id) : false;

  return (
    <Modal
      title={
        <Typography.Text strong style={{ fontSize: '16px', borderBottom: '1px solid #4ecdc4' }}>
          {currentItem.contextType || 'Item Details'}
        </Typography.Text>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="select"
          type="primary"
          style={{
            background: nodeIsSelected
              ? '#f5f5f5'
              : 'linear-gradient(135deg, #4ecdc4, #45b8ac)',
            border: 'none',
            color: nodeIsSelected ? '#333' : 'white',
            borderRadius: '6px',
            fontWeight: '500',
          }}
          onClick={() => toggleItem(currentItem)}
        >
          {nodeIsSelected ? 'Bỏ chọn' : 'Chọn'}
        </Button>,
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width="80%"
      style={{ top: 20 }}
      bodyStyle={{
        padding: '0px',
        maxHeight: '80vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <Grid style={{ padding: '0px' }}>
        <DataItem style={{ fontSize: '12px', padding: '0px' }}>
          <span className="label">ID</span>
          <span className="value" style={{ fontSize: '10px' }}>
            {currentItem.id}
          </span>
        </DataItem>
        {Object.entries(currentItem.parsedContext).map(([key, value]: [string, any]) => (
          <DataItem key={key}>
            <span className="label">{key}</span>
            <span className="value" style={{ fontSize: '10px' }}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </DataItem>
        ))}
      </Grid>
    </Modal>
  );
}; 