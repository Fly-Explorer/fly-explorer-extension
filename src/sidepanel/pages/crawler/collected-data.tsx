import React from 'react';
import { Space } from 'antd';
import { StyledLayout, StyledTabs } from '../../components/CollectedData/styles';
import { useContextTree } from './hooks/useContextTree';
import { useBounty } from './hooks/useBounty';
import { ParserSection } from './components/ParserSection';
import { CollectedDataTab } from './components/CollectedDataTab';
import { SubmitBountyTab } from './components/SubmitBountyTab';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { useTabStore } from './store/useTabStore';

export const CollectedData: React.FC = () => {
  const {
    modalVisible,
    currentItem,
    setModalVisible,
  } = useContextTree();
  
  // import data
  const { activeTab, setActiveTab } = useTabStore();

  return (
    <StyledLayout>
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
        <ParserSection />

        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          <StyledTabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'collected-data',
                label: 'Collected Data',
                children: <CollectedDataTab />,
              },
              {
                key: 'submit-bounty',
                label: 'Submit Bounty',
                children: <SubmitBountyTab />,
              },
            ]}
          />
        </Space>
      </Space>

      <ItemDetailsModal
        visible={modalVisible}
        currentItem={currentItem}
        onClose={() => setModalVisible(false)}
      />
    </StyledLayout>
  );
};
