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

const DataItem = styled.div`
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

const CustomCard = styled.div`
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 8px;
  margin-top: 8px;
`

const AnimatedButton = styled(Button)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(1px);
  }
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
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
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

        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          <PageHeader level={4} style={{ marginBottom: '12px' }}>Collected Data</PageHeader>
          <Flex vertical gap={8}>
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
