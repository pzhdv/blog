import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { useTheme } from '@/context/ThemeContext'

interface CalendarProps {
  /**
   * 有文章的日期列表
   */
  posts: { date: Date }[]
  /**
   * 当用户点击某个日期时事件
   * @param date "yyyy-MM-dd"
   */
  onDayClick?: (dateStr: string) => void
}

const BlogCalendar = ({ posts, onDayClick }: CalendarProps) => {
  const { theme } = useTheme()
  const darkMode = theme === 'dark'

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // 生成当月日期数据
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 获取文章数量
  const getPostCount = (date: Date) => {
    return posts.filter(post => isSameDay(post.date, date)).length
  }

  // 修改后的月份切换处理函数
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      // 创建新的日期实例避免引用问题
      const newDate = new Date(prevDate)
      const currentMonth = newDate.getMonth()

      // 安全设置月份
      newDate.setMonth(
        direction === 'prev' ? currentMonth - 1 : currentMonth + 1,
        1, // 设置为当月第一天避免日期溢出
      )

      return newDate
    })
  }

  // 点击日期时间
  const handleDateClick = (date: Date) => {
    // 保存当前点击日期
    setSelectedDate(date)
    // // 获取当前日期下的文章总数
    // const articleTotal = getPostCount(date)
    // if (articleTotal > 0) {
    //   // 触发事件
    //   onDayClick && onDayClick(format(date, 'yyyy-MM-dd'))
    // } else {
    //   onDayClick && onDayClick(undefined)
    // }
    onDayClick && onDayClick(format(date, 'yyyy-MM-dd'))
  }

  // 日期格子组件
  const DayTile = ({ date }: { date: Date }) => {
    const postCount = getPostCount(date)
    const isCurrentMonth = isSameMonth(date, currentDate)
    const isSelected = selectedDate && isSameDay(date, selectedDate)
    const isToday = isSameDay(date, new Date())

    return (
      <button
        onClick={() => handleDateClick(date)}
        className={`
          aspect-square p-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700
          ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : ''}
          ${isToday ? 'border border-blue-300 dark:border-blue-500' : ''}
          ${!isCurrentMonth ? 'opacity-50' : ''}
          relative
        `}
      >
        <div className="text-gray-700 dark:text-gray-300">
          {format(date, 'd')}
        </div>

        {/* 文章标记点 */}
        {postCount > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-[2px]">
            {[...Array(Math.min(postCount, 3))].map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
              />
            ))}
          </div>
        )}
      </button>
    )
  }

  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      {/* 日历头部 */}
      <div
        className={`flex items-center justify-between mb-4 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
      >
        <h3 className="font-semibold text-lg">
          {format(currentDate, 'yyyy年MM月')}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleMonthChange('prev')}
            className={`
              group p-2 rounded-lg transition-all duration-300
              hover:bg-gradient-to-l hover:from-blue-500/10 hover:to-transparent
              ${
                darkMode
                  ? 'hover:shadow-[0_0_12px_-2px_rgba(96,165,250,0.3)]'
                  : 'hover:shadow-[0_0_12px_-2px_rgba(59,130,246,0.2)]'
              }
              active:scale-95
            `}
            aria-label="上一月"
          >
            <svg
              className={`
                w-6 h-6 transition-transform duration-300
                ${darkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-500'}
                group-hover:-translate-x-0.5
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                d="M15 6l-6 6 6 6"
                className={darkMode ? 'opacity-90' : 'opacity-80'}
              />
              <path
                d="M11 6l-6 6 6 6"
                className={`
                  ${darkMode ? 'text-blue-600' : 'text-blue-200'}
                  opacity-0
                  group-hover:opacity-40
                `}
                strokeWidth="2.5"
              />
            </svg>
          </button>
          <button
            onClick={() => handleMonthChange('next')}
            className={`
              group p-2 rounded-lg transition-all duration-300
              hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-transparent
              ${
                darkMode
                  ? 'hover:shadow-[0_0_12px_-2px_rgba(96,165,250,0.3)]'
                  : 'hover:shadow-[0_0_12px_-2px_rgba(59,130,246,0.2)]'
              }
              active:scale-95
            `}
            aria-label="下一月"
          >
            <svg
              className={`
                w-6 h-6 transition-transform duration-300
                ${darkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-500'}
                group-hover:translate-x-0.5
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                d="M9 6l6 6-6 6"
                pathLength="1"
                className={`
                  stroke-current
                  ${darkMode ? 'opacity-90' : 'opacity-80'}
                `}
              />
              <path
                d="M13 6l6 6-6 6"
                className={`
                  stroke-current
                  ${darkMode ? 'text-blue-600' : 'text-blue-200'}
                  opacity-0
                  group-hover:opacity-40
                  transition-opacity
                  duration-500
                `}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div
            key={day}
            className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => (
          <DayTile key={index} date={date} />
        ))}
      </div>

      {/* 底部统计 */}
      <div
        className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <p
          className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          📅 本月已发布文章：
          {posts.filter(p => isSameMonth(p.date, currentDate)).length} 篇
        </p>
      </div>
    </div>
  )
}

export default BlogCalendar
