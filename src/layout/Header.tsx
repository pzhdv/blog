import { forwardRef, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { CloseIcon, LogoIcon, MenuIcon } from '@/components/Icons'

const LOGO_NAME = import.meta.env.VITE_LOGO_NAME || 'PzhBlog'

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
const Header = forwardRef<HTMLElement>((_props, ref) => {
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
    <header>
      {/* 导航栏 */} {/* fixed top-0 left-0 z-1 固定头部 */}
      <nav
        ref={ref}
        className="fixed top-0 left-0 z-1 w-full  bg-white dark:bg-gray-800 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* 左侧品牌LOGO */}
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center space-x-2">
                <LogoIcon />
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  {LOGO_NAME}
                </span>
              </NavLink>
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
                        className={` absolute bottom-0 left-0 w-full h-[2px] origin-center scale-x-0 bg-linear-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 transition-transform duration-300
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
              {/* 移动端菜单按钮 - 汉堡图标 */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'} // 动态切换标签（根据菜单状态）
                aria-expanded={isMenuOpen} // 额外增强：告诉屏幕阅读器菜单当前展开/折叠状态
              >
                <MenuIcon />
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
                  {/* 关闭按钮 - 叉号图标 */}
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="关闭菜单" // 固定描述（仅用于关闭菜单）
                    aria-expanded="false" // 增强：告知菜单即将折叠
                  >
                    <CloseIcon />
                  </button>
                </div>
                {/* 菜单内容 */}
                <div className="bg-white dark:bg-gray-800 py-4 pl-10 space-y-4">
                  {navList.map(item => (
                    <NavLink
                      key={item.link}
                      to={item.link}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
})

Header.displayName = 'Header'
export default Header
