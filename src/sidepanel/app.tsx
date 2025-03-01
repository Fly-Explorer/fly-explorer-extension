import React, { useEffect } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CollectedData } from './pages/crawler/collected-data'
import { Default } from './pages/crawler'
import { NoParsers } from './pages/crawler/no-parsers'
import ContentScript from '../contentScript/content-script'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Chat } from './pages/personal'
import { Layout, Typography, Button } from 'antd'

export const App: React.FC = () => {
  const queryClient = useQueryClient()

  const checkAndUpdateTab = async () => {
    const currentTab = await ContentScript.getCurrentTab();
    const currentUrl = currentTab?.url || '';

    // Get the last URL from storage
    const { lastActiveUrl } = await chrome.storage.local.get('lastActiveUrl');

    // Only clear cache if URL has changed
    if (lastActiveUrl !== currentUrl) {
      await chrome.storage.local.set({ lastActiveUrl: currentUrl });
      queryClient.clear();
    }
  };

  useEffect(() => {
    const { unsubscribe } = ContentScript.onActiveTabChange(() => {
      checkAndUpdateTab();
    });

    // Initial check
    checkAndUpdateTab();

    return unsubscribe;
  }, []);

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
      <Layout style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Layout.Content style={{ textAlign: 'center', padding: '24px' }}>
          <Typography.Title level={4} style={{ marginBottom: 16 }}>
            Connection Lost
          </Typography.Title>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            No connection to the context page. Please reload the webpage.
          </Typography.Text>
          <Button
            type="primary"
            onClick={handleReloadClick}
            loading={isPageReloading}
            size="large"
          >
            Reload Page
          </Button>
        </Layout.Content>
      </Layout>
    )
  }

  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" Component={Chat} />
        <Route path="/default" Component={Default} />
        <Route path="collected-data" Component={CollectedData} />
        <Route path="no-parsers" Component={NoParsers} />
      </Routes>
    </MemoryRouter>
  )
}
