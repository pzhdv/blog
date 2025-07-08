import { useAppStateContext } from '@/context/AppStateContext'

/**
 * @description:主题切换按钮组件
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useAppStateContext()
  return (
    <button
      onClick={() => toggleTheme()}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <div className="h-6 w-6 text-gray-600 dark:text-yellow-400">
        {theme === 'dark' ? '☀️' : '🌙'}
      </div>
    </button>
  )
}

export default ThemeToggle
