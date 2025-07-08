import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { queryArticleById } from '@/api'

import type { Article } from '@/types'

import MarkdownRenderer from '@/components/MarkdownRenderer'
import Skeleton from '@/components/Skeleton'

const BlogDetail = () => {
  const navigate = useNavigate()
  const { articleId } = useParams()
  const location = useLocation()
  const fromPage = location.state?.from || 'unknown'
  console.log('fromPage', fromPage)

  const [article, setArticle] = useState<Article | null>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /**
     * 判断是否是数字或数字字符
     * @param value
     * @returns
     */
    const isNumeric = (value: string | number | undefined): boolean => {
      if (typeof value === 'number') {
        return !isNaN(value) && Number.isFinite(value)
      } else if (typeof value === 'string') {
        return /^[0-9]+$/.test(value)
      }
      return false
    }

    if (!articleId) return
    const getArticleById = async () => {
      try {
        // setLoading(true)
        const res = await queryArticleById(parseInt(articleId))
        setArticle(res.data)
      } catch (error) {
        console.error(error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    // 滚动到页面顶部
    const scrollToTop = () => {
      if (
        window.scrollTo &&
        'scrollBehavior' in document.documentElement.style
      ) {
        // 现代浏览器支持平滑滚动
        window.scrollTo({
          top: 0,
          behavior: 'auto',
        })
      } else {
        // 旧浏览器或移动端浏览器，使用简单的滚动
        window.scrollTo(0, 0)
      }
    }

    scrollToTop()
    if (isNumeric(articleId)) {
      getArticleById()
    }
  }, [articleId])

  const handleBack = () => {
    // if (fromPage === 'home') {
    // } else if (fromPage === 'category') {
    // }
    navigate(-1)
  }
  // 渲染导航栏
  const renderNavigationBar = () => {
    return (
      <div className=" bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center">
            <button
              onClick={handleBack}
              className="hover:cursor-pointer flex items-center gap-2 text-gray-600 dark:text-gray-400  hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M142.5408 480h806.762667a32 32 0 1 1 0 64H141.986133l368.029867 368.0256a32 32 0 1 1-45.256533 45.256533l-398.912-398.912c-25.4592-25.454933-25.4592-66.730667 0-92.1856l398.912-398.912a32 32 0 0 1 45.256533 45.252267L142.5408 480z"
                  p-id="1478"
                  fill="currentColor"
                ></path>
              </svg>
              <span className="font-medium">返回</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
  // 渲染文章不存在
  const renderArticleEmpty = () => {
    // 加载状态
    if (loading) {
      return <Skeleton />
    }
    if (article) {
      return
    }

    return (
      <div className="flex flex-col items-center justify-center ">
        <svg
          className="w-20 h-20 text-gray-400 dark:text-gray-600"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path
            d="M881.780693 836.394667v62.122666a79.872 79.872 0 0 1-24.213333 58.56A79.573333 79.573333 0 0 1 799.114027 981.333333H82.676693a79.573333 79.573333 0 0 1-58.453333-24.256A79.872 79.872 0 0 1 0.010027 898.517333V125.482667C0.010027 102.613333 8.074027 83.093333 24.22336 66.922667A79.573333 79.573333 0 0 1 82.676693 42.666667h716.437334a79.573333 79.573333 0 0 1 58.453333 24.256 79.872 79.872 0 0 1 24.213333 58.56v193.28a27.584 27.584 0 1 1-55.104 0v-193.28c0-7.616-2.688-14.122667-8.064-19.52a26.517333 26.517333 0 0 0-19.498666-8.085334H82.676693c-7.616 0-14.101333 2.709333-19.477333 8.106667a26.624 26.624 0 0 0-8.085333 19.498667v773.034666c0 7.616 2.709333 14.122667 8.085333 19.52 5.376 5.376 11.861333 8.085333 19.477333 8.085334h716.437334c7.616 0 14.122667-2.709333 19.498666-8.106667 5.376-5.376 8.064-11.882667 8.064-19.498667v-62.122666a27.584 27.584 0 1 1 55.104 0zM497.780693 426.666667c0 15.701333-12.202667 28.437333-27.242666 28.437333H197.940693C182.87936 455.104 170.676693 442.368 170.676693 426.666667s12.202667-28.437333 27.264-28.437334h272.597334c15.04 0 27.242667 12.736 27.242666 28.437334z m505.386667-17.002667a27.52 27.52 0 0 1 0 39.04l-111.146667 110.698667 112.384 111.914666a27.52 27.52 0 0 1 0 39.04 27.797333 27.797333 0 0 1-39.210666 0l-112.384-111.914666-112.384 111.914666a27.797333 27.797333 0 0 1-39.210667 0 27.52 27.52 0 0 1 0-39.04l112.384-111.914666-111.146667-110.72a27.52 27.52 0 0 1 0-39.04 27.797333 27.797333 0 0 1 39.189334 0l111.168 110.72 111.146666-110.72a27.797333 27.797333 0 0 1 39.232 0zM497.802027 640c0 15.701333-12.202667 28.437333-27.242667 28.437333H197.940693C182.87936 668.437333 170.676693 655.701333 170.676693 640s12.202667-28.437333 27.264-28.437333h272.597334c15.04 0 27.242667 12.736 27.242666 28.437333z"
            p-id="6488"
          ></path>
        </svg>
        <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 my-2">
          文章不存在
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          您访问的文章可能已被删除或尚未发布。
        </p>
      </div>
    )
  }
  // 渲染文章详情
  const renderArticleDetail = () => {
    if (!article) return
    return (
      <article className="space-y-8 ">
        {/* 标题区 */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
            {article?.title}
          </h1>

          {/* 发布时间或更新时间 */}
          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6"
                viewBox="0 0 1024 1024"
                version="1.1"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M768 218.112h-51.2v-51.2a25.6 25.6 0 0 0-51.2 0v51.2H358.4v-51.2a25.6 25.6 0 0 0-51.2 0v51.2H256a128 128 0 0 0-128 128v409.6a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128v-409.6a128 128 0 0 0-128-128zM179.2 346.112A76.8 76.8 0 0 1 256 269.312h51.2v153.6a25.6 25.6 0 0 0 51.2 0v-153.6h307.2v153.6a25.6 25.6 0 0 0 51.2 0v-153.6h51.2a76.8 76.8 0 0 1 76.8 76.8v153.6h-665.6z m665.6 409.6a76.8 76.8 0 0 1-76.8 76.8H256a76.8 76.8 0 0 1-76.8-76.8v-204.8h665.6z"
                  p-id="1620"
                ></path>
              </svg>
              {article?.createTime?.split(' ')[0]} {/* "2025-05-06 01:42:09" */}
            </div>
          </div>
        </div>

        {/* 标签部分 */}
        <div className="flex gap-2 mb-8">
          {article?.articleTagList?.map(category => (
            <span
              key={category.articleTagId}
              className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
            >
              {category.articleTagName}
            </span>
          ))}
        </div>

        {/* 描述 */}
        <div className="text-gray-700 dark:text-gray-300 mb-0">
          {article?.excerpt}
        </div>

        {/* 正文内容 */}
        <div className="prose prose-lg dark:prose-invert overflow-x-hidden">
          {/* px-2  */}
          <div className="text-gray-700 dark:text-gray-300 space-y-8 px-0 md:px-2 ">
            <MarkdownRenderer content={article?.markdown || ''} />
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      {/* 导航栏 */}
      {renderNavigationBar()}
      {/* 主体内容 */}
      <div className="max-w-full mx-auto px-0 md:px-4 sm:px-6 lg:px-8 py-8">
        {/* 文章不存在状态 */}
        {renderArticleEmpty()}
        {/* 渲染文章详情 */}
        {renderArticleDetail()}
      </div>
    </>
  )
}

export default BlogDetail
