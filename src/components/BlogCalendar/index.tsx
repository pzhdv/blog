import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  getDay,
} from 'date-fns'

import { useAppStateContext } from '@/context/AppStateContext'
import { NextMonthIcon, PrevMonthIcon } from '@/components/Icons'

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
  const { theme } = useAppStateContext()
  const darkMode = theme === 'dark'

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // 生成当月日期数据
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  // 获取月初第一天是星期几 (0是星期日，6是星期六)
  const firstDayOfWeek = getDay(monthStart)

  // 获取月末最后一天是星期几
  const lastDayOfWeek = getDay(monthEnd)

  // 计算需要显示的上个月的天数
  const daysFromPrevMonth = firstDayOfWeek

  // 计算需要显示的下个月的天数
  const daysFromNextMonth = 6 - lastDayOfWeek

  // 计算日历显示的起始日期（上个月的日期）
  const calendarStart = subDays(monthStart, daysFromPrevMonth)

  // 计算日历显示的结束日期（下个月的日期）
  const calendarEnd = addDays(monthEnd, daysFromNextMonth)

  // 生成完整的日历日期（包含上月、本月和下月的部分日期）
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // 获取文章数量
  const getPostCount = (date: Date) => {
    return posts.filter(post => isSameDay(post.date, date)).length
  }

  // 月份切换处理函数
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
    onDayClick && onDayClick(format(date, 'yyyy-MM-dd'))
  }

  // 日期格子组件
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
        relative
      `}
      >
        {/* 文字根据是否当月切换文字颜色 */}
        <div
          className={`
        ${
          darkMode
            ? isCurrentMonth
              ? 'text-gray-300'
              : 'text-gray-500'
            : isCurrentMonth
              ? 'text-gray-700'
              : 'text-gray-600'
        }
      `}
        >
          {format(date, 'd')}
        </div>

        {/* 文章标记点：圆点始终不透明，不管是否当月 */}
        {postCount > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
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
              hover:bg-linear-to-l hover:from-blue-500/10 hover:to-transparent
              ${
                darkMode
                  ? 'hover:shadow-[0_0_12px_-2px_rgba(96,165,250,0.3)]'
                  : 'hover:shadow-[0_0_12px_-2px_rgba(59,130,246,0.2)]'
              }
              active:scale-95
            `}
            aria-label="上一月"
          >
            <PrevMonthIcon darkMode={darkMode} />
          </button>
          <button
            onClick={() => handleMonthChange('next')}
            className={`
              group p-2 rounded-lg transition-all duration-300
              hover:bg-linear-to-r hover:from-blue-500/10 hover:to-transparent
              ${
                darkMode
                  ? 'hover:shadow-[0_0_12px_-2px_rgba(96,165,250,0.3)]'
                  : 'hover:shadow-[0_0_12px_-2px_rgba(59,130,246,0.2)]'
              }
              active:scale-95
            `}
            aria-label="下一月"
          >
            <NextMonthIcon darkMode={darkMode} />
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

      {/* 日期网格 - 使用完整的日历日期数组 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
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
