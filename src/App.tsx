import { RouterProvider } from 'react-router-dom'
import routes from '@/routers'

import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'

function App() {
  return (
    <GlobalErrorBoundary showStackTrace={import.meta.env.DEV}>
      <RouterProvider router={routes} />
    </GlobalErrorBoundary>
  )
}

export default App
