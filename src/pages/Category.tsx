import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import useDeviceType from '@/hooks/useDeviceType'

import type {
  ArticleCategory,
  CategoryPageQueryArticleListParams as QueryParams,
} from '@/types'

import { useCategoryStore } from '@/store'

import { collectCategoryIds } from '@/utils/categoryPageUtils'

import IconFont from '@/components/IconFont'
import PcPagination from '@/components/PcPagination'
import InfiniteScroll from '@/components/InfiniteScroll'
import {
  CategoryNavSkeleton,
  CategoryArticleListSkeleton,
  BreadcrumbSkeleton,
  PaginationSkeleton,
} from '@/components/Skeleton'
import { EmptyIcon, ExpandIcon } from '@/components/Icons'

const ROOT_CATEGORY_ID = 1
const PC_PageSize = 3
const Mobile_PageSize = 4
const SITE_NAME = import.meta.env.VITE_SITE_NAME || '技术博客'
const SITE_URL = import.meta.env.VITE_SITE_URL || ''

export default function BlogCategoryPage() {
  const isMobile = useDeviceType()
  const navigate = useNavigate()

  const {
    articleCategoryTreeList,
    articleCategoryList,

    hasInitSearch,
    loading,
    initFetch,

    articleList,
    totalPage,
    currentPage,
    hasMore,
    queryArticleList,
    loadMore,

    isFromDetailPage,
    setIsFromDetailPage,

    expandedCategories,
    setExpandedCategories,

    activeCategoryId,
    setActiveCategoryId,

    setCategoryIds,

    currentCategoryPathList,
    setCurrentCategoryPathList,

    scrollTop,
    setScrollTop,

    hasQueryArticleList,
  } = useCategoryStore()

  const previousIsMobileRef = useRef(isMobile)
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: isMobile ? Mobile_PageSize : PC_PageSize,
    pageNum: currentPage,
    categoryIds: [],
  })

  useEffect(() => {
    if (!hasInitSearch) {
      initFetch(ROOT_CATEGORY_ID, queryParams)
    }
  }, [hasInitSearch, queryParams])

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
    const handleCategoriesExpansion = () => {
      if (isMobile) {
        const allCollapsed = articleCategoryList.reduce(
          (acc, category) => {
            acc[category.categoryId] = false
            return acc
          },
          {} as Record<string, boolean>,
        )
        setExpandedCategories({ ...allCollapsed, ...expandedCategories })
      } else {
        const allExpanded = articleCategoryList.reduce(
          (acc, category) => {
            acc[category.categoryId] = true
            return acc
          },
          {} as Record<string, boolean>,
        )
        setExpandedCategories(allExpanded)
      }
    }
    handleCategoriesExpansion()
  }, [isMobile, articleCategoryList])

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

  const getCategoryPath = (
    category: ArticleCategory,
    allCategories: ArticleCategory[],
  ): string[] => {
    const path: string[] = [category.categoryName]

    const findParentPath = (categoryId: number): void => {
      const parentCategory = allCategories.find(
        cat => cat.categoryId === categoryId,
      )
      if (parentCategory) {
        path.unshift(parentCategory.categoryName)
        findParentPath(parentCategory.parentId)
      }
    }

    if (category.parentId) {
      findParentPath(category.parentId)
    }

    return path
  }

  const handlePageButtonClick = (pageNum: number) => {
    updateAndRefetch({ pageNum })
  }

  const handleCategoryClick = (category: ArticleCategory) => {
    const fullPath = getCategoryPath(category, articleCategoryList)
    setCurrentCategoryPathList(fullPath)
    setActiveCategoryId(category.categoryId)
    const categoryIds = collectCategoryIds(category)
    setCategoryIds(categoryIds) //把最新分类ID写入全局store
    updateAndRefetch({ pageNum: 1 })
  }

  const handleLoadMore = async () => {
    if (loading) return
    loadMore(queryParams)
  }

  const toDetailPage = (articleId: number) => {
    setScrollTop(window.scrollY)
    navigate(`/detail/${articleId}`, { state: { from: 'category' } })
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    })
  }

  const renderLeftCategory = () => {
    return (
      <div className="md:w-64 mb-6 md:mb-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm md:sticky md:top-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">
            分类导航
          </h2>
          <div className="space-y-1">
            {renderCategoryTree(articleCategoryTreeList)}
          </div>
        </div>
      </div>
    )
  }

  const renderCategoryTree = (items: ArticleCategory[], level = 0) => {
    return items.map(category => (
      <div
        key={category.categoryId}
        className={`relative ${level > 0 ? 'ml-4' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              handleCategoryClick(category)
            }}
            className={`flex-1 flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-gray-600
              ${
                activeCategoryId === category.categoryId
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/70 dark:text-blue-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }
              ${level > 0 ? 'text-sm' : 'font-medium'}
              dark:text-gray-200
              ${activeCategoryId === category.categoryId ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/70 dark:text-blue-200' : ''}`}
          >
            <span className="dark:text-gray-400">
              <IconFont iconClass={category.iconClass} size={20} />
            </span>
            <span className="truncate">{category.categoryName}</span>
            <span className="text-xs text-gray-500 ml-auto dark:text-gray-200">
              {category.articleTotal}
            </span>
          </button>

          {category.children && category.children.length > 0 && (
            <button
              onClick={e => {
                e.stopPropagation()
                toggleCategoryExpansion(category.categoryId)
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
            >
              <span
                className={`block transform transition-transform duration-200 ${
                  expandedCategories[category.categoryId] ? 'rotate-90' : ''
                }`}
              >
                <ExpandIcon />
              </span>
            </button>
          )}
        </div>

        {category.children && expandedCategories[category.categoryId] && (
          <div className="mt-1 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  const renderBreadcrumb = () => {
    return (
      <div className="mb-6 flex items-center overflow-x-auto pb-2">
        {currentCategoryPathList.map((path, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            <span
              className={`text-sm dark:text-gray-300 ${index === currentCategoryPathList.length - 1 ? 'font-medium' : ''}`}
            >
              {path}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const renderArticleListEmpty = () => {
    if (loading) {
      return
    }
    return (
      articleList.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <EmptyIcon />
          <h3 className="text-xl font-semibold mb-4">暂无文章列表</h3>
          <p className="text-sm">
            当前分类没有文章可供显示，请尝试一下其它分类。
          </p>
        </div>
      )
    )
  }

  const renderArticleList = () => {
    return articleList.map((article, index) => {
      // 💻PC：当前页面前4张不lazy；📱移动端：前2张不lazy
      const threshold = isMobile ? 2 : PC_PageSize
      const isAboveTheFold = index < threshold
      return (
        <article
          onClick={() => toDetailPage(article.articleId)}
          key={article.articleId}
          className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full aspect-[16/9] md:w-64 rounded-lg overflow-hidden flex-shrink-0 ">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                // 首屏图片不渲染loading属性；非首屏启用浏览器懒加载
                loading={isAboveTheFold ? undefined : 'lazy'}
                // 仅首屏图片设置高加载优先级，不要大量使用high
                fetchPriority={isAboveTheFold ? 'high' : undefined}
              />
            </div>
            <div className="flex-1">
              {/* 桌面端显示：日期 + 分类 | 移动端隐藏 */}
              <div className="flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 hidden md:flex">
                <time>{article.createTime?.split(' ')[0]}</time>
                <div className="flex gap-1">
                  {article.articleCategoryList?.map((cat, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                    >
                      {cat.categoryName}
                    </span>
                  ))}
                </div>
              </div>
              {/* 移动端只显示：分类 */}
              <div className="flex gap-1 text-sm mb-2 md:hidden">
                {article.articleCategoryList?.map((cat, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                  >
                    {cat.categoryName}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                {article.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {article.excerpt}
              </p>

              {/* 移动端：日期 + 阅读全文 */}
              <div className="flex justify-between items-center w-full">
                {/* 移动端日期 */}
                <time className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                  {article.createTime?.split(' ')[0]}
                </time>
                {/* 阅读全文按钮 */}
                <button className="ml-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  阅读全文 →
                </button>
              </div>
            </div>
          </div>
        </article>
      )
    })
  }

  const renderHelmet = () => (
    <Helmet>
      <title>{`分类 - ${SITE_NAME}`}</title>
      <meta
        name="description"
        content={`${SITE_NAME} - 按分类浏览所有技术文章，包括 ${currentCategoryPathList[currentCategoryPathList.length - 1] || '全部分类'} 等`}
      />
      <meta
        name="keywords"
        content="技术博客, 文章分类, 前端开发, React, TypeScript"
      />
      <link rel="canonical" href={`${SITE_URL}/category`} />
    </Helmet>
  )

  return (
    <>
      {renderHelmet()}
      <div className="md:flex md:gap-8 max-w-7xl mx-auto px-4 py-6 min-h-[90vh] md:min-h-[50vh]">
        {/* 分类导航骨架屏 */}
        {!hasInitSearch && <CategoryNavSkeleton />}
        {/* 分类侧边栏 */}
        {hasInitSearch && renderLeftCategory()}

        {/* 主内容区 */}
        <div className="flex-1">
          {/* 面包屑骨架屏 */}
          {!hasInitSearch && <BreadcrumbSkeleton />}
          {/* 面包屑导航 */}
          {hasInitSearch && renderBreadcrumb()}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
            {/* 文章列表骨架屏 */}
            {loading && articleList.length === 0 && (
              <CategoryArticleListSkeleton />
            )}
            {/* 空列表为空显示 */}
            {renderArticleListEmpty()}
            {/* 文章列表 */}
            {renderArticleList()}
          </div>

          {/* 分页骨架屏 */}
          {!isMobile && loading && articleList.length === 0 && (
            <PaginationSkeleton />
          )}
          {/* 分页 */}
          {!isMobile && (
            <PcPagination
              totalPage={totalPage}
              currentPage={currentPage}
              onClick={handlePageButtonClick}
            />
          )}

          {/* 移动端无限滚动 */}
          {isMobile
            ? articleList.length > 0 && (
                <InfiniteScroll
                  loadMore={handleLoadMore}
                  hasMore={hasMore}
                  loading={loading}
                  threshold={50}
                />
              )
            : null}
        </div>
      </div>
    </>
  )
}
