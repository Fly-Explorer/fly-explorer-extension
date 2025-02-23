import { ParserConfig } from '../../../core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Layout as AntdLayout,
  Button,
  Flex,
  Space,
  TreeSelect,
  Typography,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClonedContextNode } from '../../../common/types'
import { getNameFromId } from '../../../utils'
import CodeEditor from '../../components/CodeEditor'
import { Layout } from '../../components/layout'
import { TreeTraverser } from '../../components/tree-traverser'
import ContentScript from '../../../contentScript/content-script'
import styled from 'styled-components'
import { uploadFile } from '../../../tusky'
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
  PageHeader
} from '../../components/CollectedData/styles'

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
  const [uploadResponse, setUploadResponse] = useState<{ url: string; options: UploadOptions } | null>(null)

  const [contextTypes, setContextTypes] = useState<string[]>([])
  const [isCodeEditorOpened, setIsCodeEditorOpened] = useState(false)
  const [suiAddress, setSuiAddress] = useState<string>('')

  useEffect(() => {
    chrome.storage.local.get('suiAddress').then((result) => {
      setSuiAddress(result.suiAddress || '')
    })
  }, [])

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
  console.log("Parsers", parsers)

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
    [contextTree]
  )

  if (!contextTree) {
    return (
      <Layout>
        <Typography.Text style={{ textAlign: 'center' }}>No context tree</Typography.Text>
      </Layout>
    )
  }

  const handleContextTypeChange = (values: string[]) => {
    setContextTypes(values)
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

  console.log("Selected indices", selectedData)

  return (
    <StyledLayout style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        {parsers?.length ? (
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            <ParserHeader style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography.Title level={4} style={{ margin: '0' }}>
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
                  padding: '4px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
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

        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <PageHeader level={4}>Collected Data</PageHeader>
          <Flex vertical gap="small">
            <StickyContainer>
              <AnimatedButton
                block
                type="primary"
                onClick={async () => {
                  try {
                    await uploadFile(
                      selectedData.map(node => node.parsedContext) as unknown as JSON,
                      suiAddress,
                      (percentage) => {
                        console.log('Upload progress:', percentage)
                      },
                      (upload) => {
                        console.log('Upload complete:', upload)
                        setSelectedData([])
                        setUploadResponse({
                          url: upload.url ?? '',
                          options: upload.options
                        })
                      },
                      () => {
                        console.error('Upload failed')
                        setUploadResponse(null)
                      }
                    )
                  } catch (error) {
                    console.error('Error uploading:', error)
                    setUploadResponse(null)
                  }
                }}
                disabled={selectedData.length === 0}
                style={{
                  background: 'linear-gradient(135deg, #4ecdc4, #45b8ac)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '600',
                  height: '44px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.25)',
                  marginBottom: '12px',
                  fontSize: '15px',
                }}
              >
                {selectedData.length > 0
                  ? `Upload ${selectedData.length} item${selectedData.length > 1 ? 's' : ''}`
                  : 'Upload'
                }
              </AnimatedButton>

              {uploadResponse && (
                <SuccessCard style={{ marginBottom: '12px' }}>
                  <Flex justify="space-between" align="center">
                    <Typography.Title level={5} style={{
                      color: '#9333ea',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        background: '#a855f7',
                        borderRadius: '50%',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}></span>
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
                        padding: '4px 8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
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
                        style={{ color: '#9333ea', textDecoration: 'none' }}
                      >
                        {`https://app.tusky.io/vaults/${uploadResponse.options.metadata?.vaultId}/assets`}
                      </a>
                    </DataItem>
                    {uploadResponse.options && (
                      <DataItem>
                        <span className="label">Metadata</span>
                        <span className="value">
                          {uploadResponse.options.metadata ?
                            Object.entries(uploadResponse.options.metadata).map(([key, value]) =>
                              `${key}: ${value}`
                            ).join('\n')
                            : 'No metadata'
                          }
                        </span>
                      </DataItem>
                    )}
                  </Grid>
                </SuccessCard>
              )}
              <StyledTreeSelect
                style={{ width: '100%', marginBottom: '12px' }}
                value={contextTypes}
                dropdownStyle={{
                  maxHeight: 400,
                  overflow: 'auto',
                  borderRadius: '10px',
                  padding: '8px',
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
                  if (!contextTypes.includes(node.contextType) && contextTypes.length > 0) return null
                  const isSelected = selectedData.some(selectedNode => selectedNode.id === node.id)

                  return (
                    <CustomCard
                      onClick={() => {
                        if (isSelected) {
                          setSelectedData(prev => prev.filter(n => n.id !== node.id))
                        } else {
                          setSelectedData(prev => [...prev, node])
                        }
                      }}
                      className={isSelected ? 'selected' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <Flex justify="space-between" align="center" style={{ marginBottom: '8px' }}>
                        <Typography.Text strong style={{
                          color: isSelected ? '#45b8ac' : 'inherit',
                          transition: 'color 0.3s ease'
                        }}>
                          {node.contextType}
                        </Typography.Text>
                        <SelectButton
                          size="small"
                          className={isSelected ? 'selected' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              setSelectedData(prev => prev.filter(n => n.id !== node.id))
                            } else {
                              setSelectedData(prev => [...prev, node])
                            }
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </SelectButton>
                      </Flex>
                      <Grid>
                        <DataItem>
                          <span className="label">ID</span>
                          <span className="value">{node.id}</span>
                        </DataItem>
                        {Object.entries(node.parsedContext).map(([key, value]: [string, any]) => (
                          <DataItem key={key}>
                            <span className="label">{key}</span>
                            <span className="value">{value}</span>
                          </DataItem>
                        ))}
                      </Grid>
                    </CustomCard>
                  )
                }}
              />
            </ScrollableContent>
          </Flex>
        </Space>
      </Space>
    </StyledLayout>
  )
}
