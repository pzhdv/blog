import Layout from '@/layout'
import Home from '@/pages/Home'
import Category from '@/pages/Category'
import About from '@/pages/About'
import BlogDetail from '@/pages/BlogDetail'
import Error404 from '@/pages/Error404'
import { createBrowserRouter } from 'react-router-dom'

const routes = createBrowserRouter([
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

  {
    path: '*',
    element: <Error404 />, // 404 页面
  },
])

export default routes
