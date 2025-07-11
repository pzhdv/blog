import { NavLink } from 'react-router-dom'

const HomeIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  )
}
const ArrowLeftIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  )
}

const ExclamationTriangleIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

export default function Error404Page() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* 错误代码动画 */}
          <div className="relative inline-block mb-8">
            <span className="text-9xl font-bold text-blue-600 dark:text-blue-400 opacity-20 absolute -top-4 -left-4">
              404
            </span>
            <div className="relative">
              <ExclamationTriangleIcon className="h-32 w-32 text-red-500 mx-auto animate-pulse" />
              <span className="text-6xl font-bold text-gray-900 dark:text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                404
              </span>
            </div>
          </div>

          {/* 主要内容 */}
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            页面不存在
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            找不到您要访问的页面，可能是地址输入错误或内容已被迁移。
          </p>

          {/* 操作按钮组 */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <NavLink
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              返回首页
            </NavLink>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              返回上一页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
