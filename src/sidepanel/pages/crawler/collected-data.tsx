import { ParserConfig } from '../../../core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Layout as AntdLayout,
  Button,
  Card,
  Descriptions,
  Flex,
  Space,
  TreeSelect,
  Typography,
} from 'antd'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClonedContextNode } from '../../../common/types'
import { getNameFromId } from '../../../utils'
import CodeEditor from '../../components/CodeEditor'
import { Layout } from '../../components/layout'
import { TreeTraverser } from '../../components/tree-traverser'
import ContentScript from '../../../contentScript/content-script'
import styled from 'styled-components'

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

const CustomCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 8px;

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
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 8px;
`

const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

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
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      background: #45b8ac;
      border-radius: 50%;
    }
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
  }
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

export const CollectedData: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [contextTypes, setContextTypes] = useState<string[]>([])
  const [isCodeEditorOpened, setIsCodeEditorOpened] = useState(false)

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

  return (
    <StyledLayout style={{ padding: 16 }}>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
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
                iconPosition="start"
                style={{ padding: 0 }}
                onClick={() => setIsCodeEditorOpened((val) => !val)}
              >
                {isCodeEditorOpened ? 'Hide parser' : 'Edit scheme'}
              </Button>
            </ParserHeader>

            {isCodeEditorOpened ? (
              <CodeEditor
                parserConfig={parsers[0]}
                saveParserConfig={saveLocalParserConfig}
                isLocalParserSaving={isLocalParserSaving}
              />
            ) : null}
          </Space>
        ) : null}

        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          <Typography.Title level={4} style={{ margin: '0' }}>
            Collected Data
          </Typography.Title>
          <Flex vertical gap="small">
            <ActionButtons>
              <AnimatedButton
                block
                onClick={handlePickElementClick}
                loading={isElementPicking}
              >
                Pick Element
              </AnimatedButton>
              <AnimatedButton
                block
                onClick={handleDeleteParserClick}
                loading={isParserDeleting}
              >
                Delete Parser
              </AnimatedButton>
            </ActionButtons>
            <TreeSelect
              style={{ width: '100%' }}
              value={contextTypes}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={contextTypesTree}
              placeholder="Please select"
              treeDefaultExpandAll
              onChange={handleContextTypeChange}
              multiple
            />
            <TreeTraverser
              node={contextTree}
              component={({ node }) => {
                if (!contextTypes.includes(node.contextType) && contextTypes.length > 0) return null
                return (
                  <CustomCard>
                    <Grid>
                      {/* <DataItem>
                        <span className="label">Namespace</span>
                        <span className="value">{node.namespace}</span>
                      </DataItem> */}
                      {/* <DataItem>
                        <span className="label">Context Type</span>
                        <span className="value">{node.contextType}</span>
                      </DataItem> */}
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
          </Flex>
        </Space>
      </Space>
    </StyledLayout>
  )
}
