import { useEffect, useRef } from 'react'
import { useOutlet } from 'react-router-dom'

import Footer from './Footer'
import Header from './Header'

export default function RootLayout() {
  const navRef = useRef<HTMLElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  // 动态计算导航栏高度并设置页面主体的 padding-top
  useEffect(() => {
    const setMainPadding = () => {
      if (!navRef.current || !mainRef.current) return
      const navHeight = navRef.current.offsetHeight
      console.log('navHeight', navHeight)
      mainRef.current.style.paddingTop = `${navHeight}px`
    }

    // requestAnimationFrame：等待浏览器完成DOM布局再获取高度，防止拿到0
    const rafId = requestAnimationFrame(setMainPadding)

    window.addEventListener('resize', setMainPadding)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', setMainPadding)
    }
  }, [])

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 bg-gray-50 dark:bg-gray-900 md:flex md:flex-col`}
    >
      {/* 导航栏 */}
      <Header ref={navRef} />
      {/* 主体内容 */}

      {/* main：flex‑1 拿剩余空间，并且自身变成flex列容器 */}
      <main ref={mainRef} className="max-w-6xl mx-auto md:flex-1">
        <div style={{ minHeight: '100%' }} className="pt-8 pb-2 px-4 bg-red">
          {useOutlet()}
        </div>
      </main>
      {/* 页脚 */}
      <Footer />
    </div>
  )
}
