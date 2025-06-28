import React, { Component } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * 自定义错误恢复逻辑（默认刷新页面）
   */
  onReset?: () => void
  /**
   * 是否显示错误堆栈（生产环境建议关闭）
   */
  showStackTrace?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class GlobalErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary:', error, errorInfo)
    this.setState({ errorInfo })

    // 生产环境错误上报（示例使用 Sentry）
    if (process.env.NODE_ENV === 'production') {
      // window.Sentry?.captureException(error, { extra: errorInfo });
      console.log('生产环境错误上报', error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.props.onReset ? this.props.onReset() : window.location.reload() // 默认刷新页面
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
          {/* 错误标题区 */}
          <div className="bg-red-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-xl font-bold">应用程序发生错误</h1>
            </div>
          </div>

          {/* 错误内容区 */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              抱歉，遇到了一些问题。您可以尝试刷新页面或联系支持团队。
            </p>

            {this.props.showStackTrace && (
              <details className="border rounded-lg overflow-hidden">
                <summary className="bg-gray-50 px-4 py-2 cursor-pointer select-none">
                  错误详情（开发者可见）
                </summary>
                <div className="p-4 bg-gray-800 text-red-400 font-mono text-sm overflow-x-auto">
                  <p className="font-semibold">
                    {this.state.error?.toString()}
                  </p>
                  <pre className="mt-2 text-xs">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* 操作按钮组 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                刷新页面
              </button>

              <WithNavigate>
                {navigate => (
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    返回首页
                  </button>
                )}
              </WithNavigate>

              <a
                href="mailto:support@example.com"
                className="ml-auto px-4 py-2 text-blue-600 hover:underline"
              >
                联系支持
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// 辅助组件：在 class 组件中使用 hook
const WithNavigate = ({
  children,
}: {
  children: (navigate: any) => ReactNode
}) => {
  const navigate = useNavigate()
  return <>{children(navigate)}</>
}

export default GlobalErrorBoundary
