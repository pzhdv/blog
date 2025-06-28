import { useState, useEffect } from 'react'

// 判断当前设备是否为移动端
const useDeviceType = (): boolean => {
  // 判断窗口宽度是否小于等于 768px（Tailwind 的 md 断点）
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // 处理服务器端渲染情况
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  useEffect(() => {
    // 仅在客户端执行
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // 初始检查
    handleResize()

    // 添加 resize 事件监听
    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

export default useDeviceType
