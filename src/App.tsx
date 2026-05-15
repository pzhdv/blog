import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import routes from '@/routers'

import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import { AppStateProvider } from './context/AppStateContext'

function App() {
  return (
    <HelmetProvider>
      <GlobalErrorBoundary showStackTrace={import.meta.env.DEV}>
        <AppStateProvider>
          <RouterProvider
            router={routes}
            future={{ v7_startTransition: true }}
          />
        </AppStateProvider>
      </GlobalErrorBoundary>
    </HelmetProvider>
  )
}

export default App
