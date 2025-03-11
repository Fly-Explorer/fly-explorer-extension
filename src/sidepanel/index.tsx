import React from 'react'
import ReactDOM from 'react-dom/client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { App } from './app'

const queryClient = new QueryClient()

// Trong file index.tsx hoặc main entry
import * as styledComponents from 'styled-components';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)

// @ts-ignore
window.styledComponents = styledComponents;