import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/layout'
import Error404 from '@/pages/Error404'

import Home from '@/pages/Home'
import Category from '@/pages/Category'
import About from '@/pages/About'
import BlogDetail from '@/pages/BlogDetail'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'category',
        element: <Category />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'detail/:articleId',
        element: <BlogDetail />,
      },
    ],
  },
  // 顶层兜底404
  { path: '*', element: <Error404 /> },
])

export default router
