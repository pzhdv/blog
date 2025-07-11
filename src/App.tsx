import { RouterProvider } from 'react-router-dom'
import routes from '@/routers'

import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import { AppStateProvider } from './context/AppStateContext'

function App() {
  return (
    <GlobalErrorBoundary showStackTrace={import.meta.env.DEV}>
      <AppStateProvider>
        <RouterProvider router={routes} future={{ v7_startTransition: true }} />
      </AppStateProvider>
    </GlobalErrorBoundary>
  )
}

export default App
