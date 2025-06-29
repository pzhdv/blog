import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'

type LinkType = {
  link: string
  title: string
}
const navList: LinkType[] = [
  {
    link: '/',
    title: '首页',
  },
  {
    link: '/category',
    title: '分类',
  },
  {
    link: '/about',
    title: '关于我',
  },
]

// {/* 导航栏 */}
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false)

  // 移动菜单动画逻辑
  useEffect(() => {
    if (isMenuOpen) {
      setShouldRenderMenu(true)
    } else {
      const timer = setTimeout(() => {
        setShouldRenderMenu(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isMenuOpen])

  return (
    <>
      {/* 导航栏 */} {/* fixed top-0 left-0 z-1 固定头部 */}
      <nav className="fixed top-0 left-0 z-1 w-full  bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* 左侧品牌LOGO */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  PzhBlog
                </span>
              </a>
            </div>

            {/* 桌面导航 */}
            <div className="hidden md:flex items-center space-x-12">
              {navList.map(item => (
                <NavLink
                  key={item.link}
                  to={item.link}
                  className={({ isActive }) => `
                   text-md relative py-2 transition-colors duration-300
                    ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <div className="relative group">
                      <span className="relative z-10 block px-2 py-2">
                        {item.title}
                      </span>

                      {/* 动态下划线 (自动适配暗黑模式) */}
                      <span
                        className={` absolute bottom-0 left-0 w-full h-[2px] origin-center scale-x-0 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 transition-transform duration-300
                        ${isActive ? 'scale-x-105' : 'group-hover:scale-x-105'}
                      `}
                      />
                    </div>
                  )}
                </NavLink>
              ))}
            </div>

            {/* 黑白模式切换*/}
            <div className="hidden md:flex space-x-4 ml-4">
              <ThemeToggle />
            </div>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center space-x-4 relative top-0 r-0 z-50">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-white"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1976"
                >
                  <path
                    d="M954.88 237.056H69.12a43.52 43.52 0 1 1 0-87.04h885.248c24.064 0 43.52 19.456 43.52 43.52s-18.944 43.52-43.008 43.52zM954.88 555.52H69.12a43.52 43.52 0 1 1 0-87.04h885.248c24.064 0 43.52 19.456 43.52 43.52s-18.944 43.52-43.008 43.52zM954.88 874.496H69.12a43.52 43.52 0 1 1 0-87.04h885.248c24.064 0 43.52 19.456 43.52 43.52 0.512 24.064-18.944 43.52-43.008 43.52z"
                    fill="currentColor"
                    p-id="1977"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* 移动端菜单 */}
          {shouldRenderMenu && (
            <div
              className={`md:hidden fixed inset-0 z-50 bg-black/30 transition-opacity
                 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div
                className={`absolute right-0 top-0 h-full w-3/4 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-500
                   ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={e => e.stopPropagation()}
              >
                {/* 关闭按钮 */}
                <div className="flex justify-end mt-4 mr-4">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="h-6 w-6 text-gray-600 dark:text-white"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="currentColor"
                        d="M566.4 512l318.4-318.4c16-16 16-38.4 0-54.4s-38.4-16-54.4 0L512 457.6 192 140.8c-14.4-16-38.4-16-52.8 0s-16 38.4 0 54.4L457.6 512 139.2 830.4c-16 16-16 38.4 0 54.4 8 6.4 16 11.2 27.2 11.2s19.2-3.2 27.2-11.2l320-318.4 320 316.8c8 6.4 19.2 11.2 27.2 11.2s19.2-3.2 27.2-11.2c16-16 16-38.4 0-54.4L566.4 512z"
                        p-id="1689"
                      ></path>
                    </svg>
                  </button>
                </div>
                {/* 菜单内容 */}
                <div className="bg-white dark:bg-gray-800 py-4 pl-10 space-y-4  ">
                  {navList.map(item => (
                    <Link
                      key={item.link}
                      to={item.link}
                      className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
