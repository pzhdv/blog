import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import useDeviceType from '@/hooks/useDeviceType'

import type { HomePageQueryArticleListParams as QueryParams } from '@/types'

import { useHomeStore } from '@/store'

import BlogCalendar from '@/components/BlogCalendar'
import PcPagination from '@/components/PcPagination'
import InfiniteScroll from '@/components/InfiniteScroll'
import {
  HomeArticleListSkeleton,
  AuthorInfoSkeleton,
  CalendarSkeleton,
  TagListSkeleton,
} from '@/components/Skeleton'
import { HomeEmptyIcon } from '@/components/Icons'

const SITE_NAME = import.meta.env.VITE_SITE_NAME || '技术博客'
const SITE_URL = import.meta.env.VITE_SITE_URL || ''

const PC_PageSize = 4
const Mobile_PageSize = 5

export default function BlogHomepage() {
  const {
    hasQueryRightSiderData,
    blogAuthor,
    articleTotal,
    articleCategoryTotal,
    articlePublishDateList,
    tagList,
    queryRightSiderData,

    articleList,
    totalPage,
    currentPage,
    hasMore,
    loading,
    queryArticleList,
    loadMore,

    hasQueryArticleList,

    scrollTop,
    setScrollTop,

    isFromDetailPage,
    setIsFromDetailPage,
  } = useHomeStore()
  const navigate = useNavigate()
  const isMobile = useDeviceType()
  const previousIsMobileRef = useRef(isMobile)
  const [activeTagId, setActiveTagId] = useState<number>()
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: isMobile ? Mobile_PageSize : PC_PageSize,
    pageNum: currentPage,
  })

  useEffect(() => {
    const isFirstLoading = !hasQueryArticleList
    const deviceTypeHasChanged =
      hasQueryArticleList && isMobile !== previousIsMobileRef.current

    if (!isFirstLoading && !deviceTypeHasChanged) {
      return
    }

    previousIsMobileRef.current = isMobile

    const newParams = {
      pageSize: isMobile ? Mobile_PageSize : PC_PageSize,
      pageNum: 1,
    }
    setQueryParams(newParams)
    queryArticleList(newParams)
  }, [hasQueryArticleList, isMobile])

  useEffect(() => {
    if (isMobile) return
    if (!hasQueryRightSiderData) queryRightSiderData()
  }, [isMobile, hasQueryRightSiderData])

  useEffect(() => {
    if (isMobile) {
      if (isFromDetailPage) {
        window.scrollTo(0, scrollTop)
      } else {
        window.scrollTo(0, 0)
      }
    }

    return () => {
      setIsFromDetailPage(false)
    }
  }, [isMobile, scrollTop, isFromDetailPage])

  const updateAndRefetch = (newQueryPart: Partial<QueryParams>) => {
    const newParams = { ...queryParams, ...newQueryPart }
    setQueryParams(newParams)
    queryArticleList(newParams)
  }

  const handleLoadMore = async () => {
    if (loading) return
    loadMore(queryParams)
  }

  const onDayClick = (publishDateStr: string) => {
    updateAndRefetch({ publishDateStr, pageNum: 1 })
  }

  const handleTagClick = (articleTagId: number) => {
    setActiveTagId(articleTagId)
    updateAndRefetch({ articleTagId, pageNum: 1 })
  }

  const handlePageButtonClick = (pageNum: number) => {
    updateAndRefetch({ pageNum })
  }

  const toDetailPage = (articleId: number) => {
    setScrollTop(window.scrollY)
    navigate(`/detail/${articleId}`, { state: { from: 'home' } })
  }

  const renderEmpty = () => {
    return (
      !loading &&
      articleList.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <HomeEmptyIcon />
          <p className="text-lg font-medium">暂无文章可供显示，请稍后再来！</p>
        </div>
      )
    )
  }

  const renderArticleList = () => {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {articleList.map((article, index) => {
          // 💻PC：当前页面前4张不lazy；📱移动端：前2张不lazy
          const threshold = isMobile ? 2 : PC_PageSize
          const isAboveTheFold = index < threshold

          return (
            <article
              onClick={() => toDetailPage(article.articleId as number)}
              key={article.articleId}
              className="rounded-lg overflow-hidden transition-all duration-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-md hover:shadow-xl"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
                // 首屏图片不渲染loading属性；非首屏启用浏览器懒加载
                loading={isAboveTheFold ? undefined : 'lazy'}
                // 仅首屏图片设置高加载优先级，不要大量使用high
                fetchPriority={isAboveTheFold ? 'high' : undefined}
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  {article.title}
                </h2>
                <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-300">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{article.createTime?.split(' ')[0]}</span>
                  <button className="ml-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    阅读全文 →
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  const renderAuthorInfo = () => {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm bg-white text-gray-800  dark:bg-gray-800 dark:text-gray-100`}
      >
        <div className="flex items-start mb-6">
          <img
            src={blogAuthor?.avatar}
            alt="作者头像"
            className="w-16 h-16 rounded-full border-2 border-blue-200 dark:border-blue-800"
          />
          <div className="ml-4 flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {blogAuthor?.userNick}
            </h3>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              {blogAuthor?.position}
            </p>
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {blogAuthor?.selfIntroduction}
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {articleTotal}
            </div>
            <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              <span className="mr-1">📝</span>文章
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tagList.length}
            </div>
            <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              <span className="mr-1">🏷️</span>标签
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {articleCategoryTotal}
            </div>
            <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              <span className="mr-1">🗂️</span>分类
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTagList = () => {
    return (
      <div className="p-6 rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          标签列表
        </h3>
        <div className="flex flex-wrap gap-2">
          {tagList.map(tag => (
            <span
              onClick={() => handleTagClick(tag.articleTagId)}
              key={tag.articleTagId}
              className={`px-3 py-1 rounded-full text-sm transition-colors
                      ${
                        activeTagId === tag.articleTagId
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }
                    `}
            >
              {tag.articleTagName}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderHelmet = () => (
    <Helmet>
      <title>{`首页 - ${SITE_NAME}`}</title>
      <meta
        name="description"
        content={`${SITE_NAME} - 分享前端技术、Web开发、性能优化等优质技术文章`}
      />
      <meta
        name="keywords"
        content="技术博客, 前端开发, React, TypeScript, Web开发"
      />
      <link rel="canonical" href={SITE_URL} />
      <meta property="og:title" content={`首页 - ${SITE_NAME}`} />
      <meta
        property="og:description"
        content={`${SITE_NAME} - 分享前端技术、Web开发、性能优化等优质技术文章`}
      />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`首页 - ${SITE_NAME}`} />
    </Helmet>
  )
  return (
    <>
      {renderHelmet()}

      <div className={`grid md:grid-cols-3 gap-8  min-h-[90vh] md:min-h-0`}>
        {/* 文章列表区域 */}
        <div className="md:col-span-2">
          {/* 文章骨架屏 */}
          {loading && articleList.length === 0 && <HomeArticleListSkeleton />}
          {/* 空列表显示 */}
          {renderEmpty()}
          {/* 文章列表 */}
          {renderArticleList()}
          {/* 分页 */}
          {isMobile ? (
            articleList.length > 0 && (
              <InfiniteScroll
                loadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loading}
                threshold={50}
              />
            )
          ) : (
            <PcPagination
              totalPage={totalPage}
              currentPage={currentPage}
              onClick={handlePageButtonClick}
            />
          )}
        </div>

        {/* 侧边栏 */}
        <aside className="space-y-8 hidden md:block">
          {/* 作者信息骨架屏 */}
          {!hasQueryRightSiderData && <AuthorInfoSkeleton />}
          {/* 作者信息 */}
          {hasQueryRightSiderData && renderAuthorInfo()}
          {/* 日历骨架屏 */}
          {!hasQueryRightSiderData && <CalendarSkeleton />}
          {/* 日历组件 */}
          {hasQueryRightSiderData && (
            <BlogCalendar
              posts={articlePublishDateList}
              onDayClick={onDayClick}
            />
          )}
          {/* 标签骨架屏 */}
          {!hasQueryRightSiderData && <TagListSkeleton />}
          {/* 标签列表 */}
          {hasQueryRightSiderData && renderTagList()}
        </aside>
      </div>
    </>
  )
}
