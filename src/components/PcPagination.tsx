import { type FC } from 'react'

interface IProps {
  totalPage: number
  currentPage: number
  onClick: (pageNum: number) => void
}

/**
 * PC端分页组件
 */
const PcPagination: FC<IProps> = ({ totalPage, currentPage, onClick }) => {
  return (
    <div className="mt-6 flex justify-center">
      <div className="flex gap-2">
        {/* 第一页按钮 - 始终显示（除非只有一页） */}
        {totalPage > 1 && (
          <button
            onClick={() => onClick(1)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
          ${
            1 === currentPage
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600'
          }`}
          >
            1
          </button>
        )}

        {/* 前省略号（当当前页离第一页较远时显示） */}
        {currentPage > 3 && (
          <span className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300">
            ...
          </span>
        )}

        {/* 中间页码按钮（显示当前页附近的页码） */}
        {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
          let page
          if (currentPage <= 3) {
            page = i + 2 // 前几页从2开始显示
          } else if (currentPage >= totalPage - 2) {
            page = totalPage - 3 + i // 后几页显示最后几页
          } else {
            page = currentPage - 2 + i // 中间显示当前页前后各2页
          }

          // 确保页码在有效范围内且不是第一页或最后一页
          if (page > 1 && page < totalPage) {
            return (
              <button
                key={page}
                onClick={() => onClick(page)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
              ${
                page === currentPage
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600'
              }`}
              >
                {page}
              </button>
            )
          }
          return null
        })}

        {/* 后省略号（当当前页离最后一页较远时显示） */}
        {currentPage < totalPage - 2 && (
          <span className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300">
            ...
          </span>
        )}

        {/* 最后一页按钮 - 始终显示（除非只有一页） */}
        {totalPage > 1 && (
          <button
            onClick={() => onClick(totalPage)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
          ${
            totalPage === currentPage
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600'
          }`}
          >
            {totalPage}
          </button>
        )}
      </div>
    </div>
  )
}

export default PcPagination
