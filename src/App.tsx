import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import { Suspense } from 'react'

import route from '@/routers'

import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import { AppStateProvider } from './context/AppStateContext'

function App() {
  return (
    <HelmetProvider>
      <GlobalErrorBoundary showStackTrace={import.meta.env.DEV}>
        <AppStateProvider>
          {/* 顶层懒加载兜底 */}
          <Suspense fallback={<div className="loading">页面加载中…</div>}>
            <RouterProvider router={route} />
          </Suspense>
        </AppStateProvider>
      </GlobalErrorBoundary>
    </HelmetProvider>
  )
}

export default App
