import React, { useEffect, useState } from 'react'
import { Flex, Typography, Button, Form, Select } from 'antd'

import { AnimatedButton } from '../../../components/AnimatedButton'
import { CustomCard } from '../../../components/CustomCard'
import { StickyContainer, ScrollableContent } from '../../../components/CollectedData/styles'
import { useBounty } from '../hooks/useBounty'
import { useDataStore } from '../store/useDataStore'

export const SubmitBountyTab: React.FC = () => {
  const { selectedData, removeItem } = useDataStore()
  const [lastEvaluation, setLastEvaluation] = useState<any>(null)
  const {
    bounties,
    selectedBounty,
    loadingBounties,
    submittingBounty,
    setSelectedBounty,
    handleSubmitBounty,
  } = useBounty()

  useEffect(() => {
    chrome.storage.local.get('lastEvaluation').then((result) => {
      setLastEvaluation(result.lastEvaluation)
    })
  }, [lastEvaluation])

  return (
    <Flex vertical gap="small">
      <StickyContainer>
        <Form layout="vertical">
          <Form.Item
            label={<Typography.Text strong>Choose Bounty</Typography.Text>}
            help="Select the bounty you want to submit your collected data to"
          >
            <Select
              placeholder="Select bounty..."
              loading={loadingBounties}
              value={selectedBounty}
              onChange={setSelectedBounty}
              style={{ width: '100%' }}
              optionLabelProp="label"
              options={bounties.map((bounty) => ({
                value: bounty.cid,
                label: bounty.title,
                children: (
                  <Flex vertical>
                    <Typography.Text strong>{bounty.bountyId}</Typography.Text>
                    {bounty.creator && (
                      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {bounty.creator}
                      </Typography.Text>
                    )}
                    {bounty.rewardAmount && (
                      <Typography.Text type="success" style={{ fontSize: '12px' }}>
                        Reward: {bounty.rewardAmount}
                      </Typography.Text>
                    )}
                  </Flex>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item>
            <AnimatedButton
              block
              type="primary"
              onClick={handleSubmitBounty}
              disabled={!selectedBounty || selectedData.length === 0}
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
              {submittingBounty
                ? 'Submitting...'
                : selectedData.length > 0
                  ? `Submit ${selectedData.length} items to bounty`
                  : 'Submit to bounty'}
            </AnimatedButton>
          </Form.Item>

          {lastEvaluation && (
            <CustomCard style={{ padding: '16px', marginBottom: '16px' }}>
              <Typography.Title level={5} style={{ marginBottom: '8px' }}>
                Last Submission Evaluation
              </Typography.Title>
              <Typography.Text>
                {typeof lastEvaluation === 'string'
                  ? lastEvaluation
                  : JSON.stringify(lastEvaluation.params.evaluation, null, 2)}
              </Typography.Text>
            </CustomCard>
          )}
        </Form>

        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          Selected: <Typography.Text strong>{selectedData.length}</Typography.Text> items
        </Typography.Text>
      </StickyContainer>

      <ScrollableContent>
        <Typography.Title level={5} style={{ marginBottom: '16px' }}>
          Selected data
        </Typography.Title>

        {selectedData.length === 0 ? (
          <CustomCard style={{ padding: '16px', textAlign: 'center' }}>
            <Typography.Text type="secondary">
              No data selected. Please switch to the "Collected Data" tab to select data.
            </Typography.Text>
          </CustomCard>
        ) : (
          selectedData.map((node) => (
            <CustomCard
              key={node.id}
              style={{
                padding: '10px',
                marginBottom: '8px',
                border: '1px solid #eee',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(78, 205, 196, 0.15)',
              }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: '6px' }}>
                <Typography.Text
                  strong
                  style={{
                    color: '#45b8ac',
                    transition: 'color 0.3s ease',
                    fontSize: '13px',
                  }}
                >
                  {node.contextType}
                </Typography.Text>
                <Button
                  size="small"
                  danger
                  style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    height: 'auto',
                    borderRadius: '4px',
                  }}
                  onClick={() => removeItem(node.id!)}
                >
                  Delete
                </Button>
              </Flex>

              {(node.parsedContext.text || node.parsedContext.title || node.parsedContext.name) && (
                <Typography.Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    fontSize: '12px',
                    margin: '0 0 6px 0',
                    color: '#666',
                  }}
                >
                  {node.parsedContext.text || node.parsedContext.title || node.parsedContext.name}
                </Typography.Paragraph>
              )}
            </CustomCard>
          ))
        )}
      </ScrollableContent>
    </Flex>
  )
}
