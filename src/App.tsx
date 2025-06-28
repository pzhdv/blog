import { RouterProvider } from 'react-router-dom'
import routes from '@/routers'

import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <GlobalErrorBoundary showStackTrace={import.meta.env.DEV}>
      <ThemeProvider>
        <RouterProvider router={routes} />
      </ThemeProvider>
    </GlobalErrorBoundary>
  )
}

export default App
