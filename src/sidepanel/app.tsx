import React, { useEffect } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CollectedData } from './pages/crawler/collected-data'
import { Default } from './pages/crawler'
import { NoParsers } from './pages/crawler/no-parsers'
import ContentScript from '../contentScript/content-script'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layout } from './components/layout'
import { Button, Typography } from 'antd'

export const App: React.FC = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { unsubscribe } = ContentScript.onActiveTabChange(() => {
      queryClient.clear()
    })

    return unsubscribe
  }, [])

  const { data: isAlive } = useQuery({
    queryKey: ['ping'],
    queryFn: ContentScript.ping,
    refetchInterval: 1000,
  })

  const { mutate: reloadCurrentTab, isPending: isPageReloading } = useMutation({
    mutationFn: ContentScript.reloadCurrentTab,
  })

  const handleReloadClick = () => {
    reloadCurrentTab()
  }

  if (!isAlive) {
    return (
      <Layout>
        <Typography.Text style={{ textAlign: 'center' }}>
          No connection to the context page. Please reload the webpage.
        </Typography.Text>
        <Button type="primary" onClick={handleReloadClick} loading={isPageReloading}>
          Reload Page
        </Button>
      </Layout>
    )
  }

  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" Component={Default} />
        <Route path="collected-data" Component={CollectedData} />
        <Route path="no-parsers" Component={NoParsers} />
      </Routes>
    </MemoryRouter>
  )
}
