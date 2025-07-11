import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react'

// 类型定义
type Theme = 'light' | 'dark' // 定义主题类型，可以是 'light' 或 'dark'

// 应用状态上下文类型定义
type AppStateContextType = {
  theme: Theme // 当前主题
  toggleTheme: (theme?: Theme) => void // 切换主题的方法
}

// 创建 Context
const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
)

// 应用状态提供者组件
export function AppStateProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>('light') // 当前主题，默认为 'light'
  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null // 从 localStorage 中获取保存的主题
    if (savedTheme) {
      setTheme(savedTheme) // 如果有保存的主题，使用保存的主题
    } else {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches // 检查系统是否偏好暗色主题
      setTheme(systemPrefersDark ? 'dark' : 'light') // 如果没有保存的主题，使用系统偏好
    }
  }, [])

  // 应用主题到 DOM
  useEffect(() => {
    document.documentElement.className = theme // 将主题应用到根元素的类名中
    localStorage.setItem('theme', theme) // 保存当前主题到 localStorage
  }, [theme])

  // 切换主题方法
  const toggleTheme = useCallback((newTheme?: Theme) => {
    if (newTheme) {
      setTheme(newTheme) // 如果提供了新主题，则切换到新主题
    } else {
      setTheme(prev => (prev === 'light' ? 'dark' : 'light')) // 如果没有提供新主题，则切换到相反的主题
    }
  }, [])

  return (
    <AppStateContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

// 自定义 Hook
export function useAppStateContext() {
  const context = useContext(AppStateContext) // 使用 useContext 获取 AppStateContext
  if (!context) {
    throw new Error('useAppStateContext 必须使用一个 AppStateProvider 包裹') // 如果没有 AppStateProvider 包裹，则抛出错误
  }
  return context // 返回应用状态上下文
}
