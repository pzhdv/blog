import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// 定义 InfiniteScroll 组件的属性接口
interface InfiniteScrollProps {
  loadMore: () => Promise<void> | void // 加载更多数据的方法
  hasMore: boolean // 是否还有更多数据可加载
  threshold?: number // 用于控制 IntersectionObserver 的阈值，默认为 50
  loader?: ReactNode // 加载中的占位组件，默认为“正在加载中...”
  endMessage?: ReactNode // 没有更多数据时的提示组件，默认为“没有更多了”
  loading?: boolean // 外部控制的加载状态，可选
}

/**
 * 上拉加载更多组件
 * @param props InfiniteScrollProps
 */
const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  loadMore, // 加载更多数据的方法
  hasMore, // 是否还有更多数据
  threshold = 50, // IntersectionObserver 的阈值，默认为 50
  loader = ( // 加载中的占位组件，默认样式
    <div className="p-2 text-center text-gray-600 dark:text-gray-300">
      正在加载中...
    </div>
  ),
  endMessage = ( // 没有更多数据时的提示组件，默认样式
    <div className="p-2 text-center text-gray-600 dark:text-gray-300">
      没有更多了
    </div>
  ),
  loading: externalLoading, // 外部控制的加载状态
}) => {
  // 内部加载状态，用于在没有外部控制时管理加载状态
  const [internalLoading, setInternalLoading] = useState(false)
  // 用于存储 IntersectionObserver 实例的引用
  const observerRef = useRef<IntersectionObserver | null>(null)
  // 哨兵元素的引用，用于触发加载更多
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 合并外部和内部加载状态，优先使用外部状态（如果提供）
  const isLoading =
    externalLoading !== undefined ? externalLoading : internalLoading

  /**
   * 处理 IntersectionObserver 的回调函数
   * @param entries IntersectionObserverEntry 数组
   */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries // 获取第一个条目（哨兵元素）
      // 如果哨兵元素进入视野，并且还有更多数据且当前未加载
      if (entry.isIntersecting && hasMore && !isLoading) {
        // 如果外部没有提供 loading 状态，则使用内部状态
        if (externalLoading === undefined) {
          setInternalLoading(true) // 设置内部加载状态为 true
        }
        // 调用 loadMore 方法加载更多数据
        Promise.resolve(loadMore()).finally(() => {
          // 加载完成后，重置内部加载状态
          if (externalLoading === undefined) {
            setInternalLoading(false)
          }
        })
      }
    },
    [hasMore, isLoading, loadMore, externalLoading], // 依赖项
  )

  /**
   * 初始化 IntersectionObserver 并观察哨兵元素
   */
  useEffect(() => {
    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // 相对于视口
      rootMargin: `${threshold}px`, // 阈值范围
      threshold: 0.1, // 交集比例阈值
    })

    // 如果哨兵元素存在，则观察它
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    // 将 observer 实例存储到引用中
    observerRef.current = observer

    // 清理函数：组件卸载时取消观察
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver, threshold]) // 依赖项

  return (
    <>
      {/* 哨兵元素，用于触发加载更多 */}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      {/* 如果正在加载，显示加载占位组件 */}
      {isLoading && loader}
      {/* 如果没有更多数据且未加载，显示结束提示 */}
      {!hasMore && !isLoading && endMessage}
    </>
  )
}

export default InfiniteScroll
