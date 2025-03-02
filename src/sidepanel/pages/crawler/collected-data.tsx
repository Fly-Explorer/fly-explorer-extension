import { ParserConfig } from '../../../core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Pinata from '../../../pinata'
import {
  Layout as AntdLayout,
  Button,
  Flex,
  Space,
  TreeSelect,
  Typography,
  Modal,
  Tooltip,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClonedContextNode } from '../../../common/types'
import { getNameFromId, getUserDataIid } from '../../../utils'
import CodeEditor from '../../components/CodeEditor'
import { Layout } from '../../components/layout'
import { TreeTraverser } from '../../components/tree-traverser'
import ContentScript from '../../../contentScript/content-script'
import styled from 'styled-components'
// import { uploadFile } from '../../../tusky'
import { UploadOptions } from 'tus-js-client'
import { DataItem } from '../../components/DataItem'
import { CustomCard } from '../../components/CustomCard'
import { AnimatedButton } from '../../components/AnimatedButton'
import {
  Grid,
  ActionButtons,
  ParserHeader,
  StyledLayout,
  SelectButton,
  SuccessCard,
  StickyContainer,
  ScrollableContent,
  StyledTreeSelect,
  PageHeader,
  PulseDot
} from '../../components/CollectedData/styles'
import useStorage from '../../hooks/useStorage'
import showToast from '../../../utils/toast'
import { GroupResponseItem } from 'pinata-web3'

type ContextTypeTree = {
  value: string
  title: string
  children: ContextTypeTree[]
}

function extractContextTypesTree(nodes: ClonedContextNode[]): ContextTypeTree[] {
  const map = new Map<string, ClonedContextNode[]>()

  for (const node of nodes) {
    if (!map.has(node.contextType)) {
      map.set(node.contextType, [])
    }

    node.children?.forEach((child) => map.get(node.contextType)!.push(child))
  }

  return Array.from(map.entries()).map(([contextType, children]) => ({
    value: contextType,
    title: contextType,
    children: extractContextTypesTree(children),
  }))
}

export const CollectedData: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedData, setSelectedData] = useState<ClonedContextNode[]>([])
  const [uploadResponse, setUploadResponse] = useState<{
    url: string
    options: UploadOptions
  } | null>(null)
  const [contextTypes, setContextTypes] = useState<string[]>([])
  const [isCodeEditorOpened, setIsCodeEditorOpened] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState<ClonedContextNode | null>(null)

  const [address, setAddress] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [groups, setGroups] = useState<GroupResponseItem | null>(null)
  const [loadingUpload, setLoadingUpload] = useState<boolean>(false)

  useEffect(() => {
    chrome.storage.local.get('address').then((result) => {
      setAddress(result.address || null)
    })

    chrome.storage.local.get('selectedTopic').then((result) => {
      setSelectedTopic(result.selectedTopic || null)
    })
  }, [])

  useEffect(() => {
    const fetchGroups = async () => {
      if (address && selectedTopic) {
        const groups = await Pinata.getGroupPinata(getUserDataIid(selectedTopic, address))
        console.log('🚀 ~ fetchGroups ~ groups:', groups)
        chrome.storage.local.set({
          groups: groups,
        })
        setGroups(groups[0])
      }
    }
    fetchGroups()
  }, [address, selectedTopic])

  const { data: contextTree } = useQuery({
    queryFn: ContentScript.getContextTree,
    queryKey: ['getContextTree'],
    initialData: null,
    refetchInterval: 1000,
  })

  const { data: parsers } = useQuery({
    queryKey: ['getSuitableParserConfigs'],
    queryFn: ContentScript.getSuitableParserConfigs,
    refetchInterval: 1000,
  })
  console.log('Parsers', parsers)

  const { mutate: saveLocalParserConfig, isPending: isLocalParserSaving } = useMutation({
    mutationFn: ContentScript.saveLocalParserConfig,
  })

  // ToDo: call saveLocalParserConfig(parserConfig)

  const { isPending: isElementPicking, mutateAsync: pickElement } = useMutation({
    mutationFn: ContentScript.pickElement,
  })

  const { isPending: isParserDeleting, mutateAsync: deleteParser } = useMutation({
    mutationFn: (pcId: string) => ContentScript.deleteParser(pcId),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['getSuitableParserConfigs'] })
        .then(() => navigate('/'))
    },
  })

  const { isPending: isParserImproving, mutateAsync: improveParserConfig } = useMutation({
    mutationFn: ({ pc, html }: { pc: ParserConfig; html: string }) =>
      ContentScript.improveParserConfig(pc, html),
  })

  const contextTypesTree = useMemo(
    () => extractContextTypesTree(contextTree ? [contextTree] : []),
    [contextTree],
  )

  if (!contextTree) {
    return (
      <Layout>
        <Typography.Text style={{ textAlign: 'center' }}>No context tree</Typography.Text>
      </Layout>
    )
  }

  const handleContextTypeChange = (value: unknown, _labelList: React.ReactNode[], _extra: any) => {
    setContextTypes(value as string[])
  }

  const handlePickElementClick = async () => {
    if (!parsers?.length) return
    const pc = parsers[0]
    const html = await pickElement()
    if (!html) return
    await improveParserConfig({ html, pc })
  }

  const handleDeleteParserClick = async () => {
    if (!parsers?.length) return
    const pc = parsers[0]
    await deleteParser(pc.id)
  }

  if (isParserImproving) {
    return (
      <Layout>
        <Typography.Text style={{ textAlign: 'center' }}>Improving parser...</Typography.Text>
      </Layout>
    )
  }

  console.log('Selected indices', selectedData)

  const openItemDetails = (node: ClonedContextNode, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentItem(node)
    setModalVisible(true)
  }

  const handleCreateGroup = async () => {
    await Pinata.createGroup(getUserDataIid(selectedTopic!, address!)).then((group) => {
      setGroups(group)
      chrome.storage.local.set({
        groups: group,
      })
    })
  }

  const handleUploadFile = async () => {
    console.log('Groups Data:', groups)
    try {
      await Pinata.uploadFileToGroup(
        selectedData.map((node) => node.parsedContext) as unknown as JSON,
        selectedTopic!,
        groups!.id,
      ).then((upload) => {
        console.log('🚀 ~ handleUploadFile ~ upload:', upload)
        showToast.success('Upload successfully!')
        setSelectedData([])
      })
    } catch (error) {
      console.error('Error uploading:', error)
      showToast.error('Failed to upload!')
      setUploadResponse(null)
    }
  }

  const handleUploadClick = async () => {
    setLoadingUpload(true)
    try {
      if (!groups) {
        await handleCreateGroup().then(() => {
          handleUploadFile()
        })
      } else {
        handleUploadFile()
      }
    } catch (error) {
      console.error('Error creating group:', error)
      showToast.error('An error occurred!')
    } finally {
      setLoadingUpload(false)
    }
  }

  return (
    <StyledLayout>
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
        {parsers?.length ? (
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            <ParserHeader style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography.Title level={5} style={{ margin: '0' }}>
                {parsers[0].name
                  ? parsers[0].name
                  : parsers[0].title
                    ? parsers[0].title
                    : parsers[0].id
                      ? getNameFromId(parsers[0].id)
                      : 'Parser'}
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
                onClick={() => setIsCodeEditorOpened((val) => !val)}
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
        ) : null}

        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          <PageHeader level={5} style={{ marginBottom: '2px', marginTop: '2px' }}>
            Collected Data
          </PageHeader>
          <Flex vertical gap="small">
            <StickyContainer>
              <AnimatedButton
                block
                type="primary"
                onClick={handleUploadClick}
                loading={loadingUpload}
                style={{
                  background: loadingUpload 
                    ? 'linear-gradient(135deg, #4ecdc4, #45b8ac, #4ecdc4)' 
                    : 'linear-gradient(135deg, #4ecdc4, #45b8ac)',
                  backgroundSize: loadingUpload ? '200% 200%' : '100% 100%',
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

              {loadingUpload && (
                <SuccessCard style={{ marginBottom: '8px', padding: '10px' }}>
                  <Flex justify="space-between" align="center">
                    <Typography.Title
                      level={5}
                      style={{
                        color: '#45b8ac',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                      }}
                    >
                      <PulseDot />
                      Đang tải dữ liệu lên...
                    </Typography.Title>
                  </Flex>
                  <Typography.Text style={{ fontSize: '12px', color: '#666' }}>
                    Vui lòng đợi trong khi chúng tôi đang xử lý dữ liệu của bạn.
                  </Typography.Text>
                </SuccessCard>
              )}

              {/* {uploadResponse && !loadingUpload && (
                <SuccessCard style={{ marginBottom: '8px', padding: '10px' }}>
                  <Flex justify="space-between" align="center">
                    <Typography.Title
                      level={5}
                      style={{
                        color: '#9333ea',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          background: '#a855f7',
                          borderRadius: '50%',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      ></span>
                      Upload Success
                    </Typography.Title>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setUploadResponse(null)}
                      style={{
                        color: '#9333ea',
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease',
                        padding: '2px 6px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                    >
                      ✕
                    </Button>
                  </Flex>
                  <Grid>
                    <DataItem>
                      <span className="label">Vault URL</span>
                      <a
                        className="value"
                        href={`https://app.tusky.io/vaults/${uploadResponse.options.metadata?.vaultId}/assets`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#9333ea', textDecoration: 'none', fontSize: '12px' }}
                      >
                        {`https://app.tusky.io/vaults/${uploadResponse.options.metadata?.vaultId}/assets`}
                      </a>
                    </DataItem>
                  </Grid>
                </SuccessCard>
              )} */}
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
                    return null
                  const isSelected = selectedData.some(
                    (selectedNode) => selectedNode.id === node.id,
                  )

                  // Lấy text từ parsedContext nếu có
                  const mainText =
                    node.parsedContext.text ||
                    node.parsedContext.title ||
                    node.parsedContext.name ||
                    ''

                  return (
                    <CustomCard
                      onClick={() => {
                        if (isSelected) {
                          setSelectedData((prev) => prev.filter((n) => n.id !== node.id))
                        } else {
                          setSelectedData((prev) => [...prev, node])
                        }
                      }}
                      className={isSelected ? 'selected' : ''}
                      style={{
                        cursor: 'pointer',
                        padding: '10px',
                        marginBottom: '8px',
                        transition: 'all 0.2s ease',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        boxShadow: isSelected ? '0 2px 8px rgba(78, 205, 196, 0.15)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.boxShadow = 'none'
                        } else {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(78, 205, 196, 0.15)'
                        }
                      }}
                    >
                      <Flex justify="space-between" align="center" style={{ marginBottom: '6px' }}>
                        <Typography.Text
                          strong
                          style={{
                            color: isSelected ? '#45b8ac' : 'inherit',
                            transition: 'color 0.3s ease',
                            fontSize: '13px',
                          }}
                        >
                          {node.contextType}
                        </Typography.Text>
                        <SelectButton
                          size="small"
                          className={isSelected ? 'selected' : ''}
                          style={{
                            padding: '2px 8px',
                            fontSize: '12px',
                            height: 'auto',
                            borderRadius: '4px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isSelected) {
                              setSelectedData((prev) => prev.filter((n) => n.id !== node.id))
                            } else {
                              setSelectedData((prev) => [...prev, node])
                            }
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </SelectButton>
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
                  )
                }}
              />
            </ScrollableContent>
          </Flex>
        </Space>
      </Space>

      <Modal
        title={
          <Typography.Text strong style={{ fontSize: '16px', borderBottom: '1px solid #4ecdc4' }}>
            {currentItem?.contextType || 'Item Details'}
          </Typography.Text>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="select"
            type="primary"
            style={{
              background: selectedData.some((item) => item.id === currentItem?.id)
                ? '#f5f5f5'
                : 'linear-gradient(135deg, #4ecdc4, #45b8ac)',
              border: 'none',
              color: selectedData.some((item) => item.id === currentItem?.id) ? '#333' : 'white',
              borderRadius: '6px',
              fontWeight: '500',
            }}
            onClick={() => {
              if (currentItem) {
                if (selectedData.some((item) => item.id === currentItem.id)) {
                  setSelectedData((prev) => prev.filter((n) => n.id !== currentItem.id))
                } else {
                  setSelectedData((prev) => [...prev, currentItem])
                }
              }
            }}
          >
            {selectedData.some((item) => item.id === currentItem?.id) ? 'Deselect' : 'Select'}
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
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
        {currentItem && (
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
        )}
      </Modal>
    </StyledLayout>
  )
}
