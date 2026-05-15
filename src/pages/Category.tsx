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
    updateAndRefetch({ categoryIds, pageNum: 1 })
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
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-800/70 dark:text-purple-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }
              ${level > 0 ? 'text-sm' : 'font-medium'}
              dark:text-gray-200
              ${activeCategoryId === category.categoryId ? 'bg-purple-100 text-purple-600 dark:bg-purple-800/70 dark:text-purple-200' : ''}`}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5 text-gray-600 dark:text-gray-500"
                >
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                </svg>
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
          <svg
            className="w-20 h-20 mb-4 text-gray-400 dark:text-gray-500"
            viewBox="0 0 1524 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="6720"
          >
            <path
              d="M0 845.395349a762.046512 178.604651 0 1 0 1524.093023 0 762.046512 178.604651 0 1 0-1524.093023 0Z"
              fill="#eee"
              p-id="6721"
            ></path>
            <path
              d="M214.325581 414.362791L470.325581 11.906977h559.627907L1309.767442 409.36186"
              fill="#FFFFFF"
              p-id="6722"
            ></path>
            <path
              d="M224.327442 420.792558l-20.003721-12.859535L463.895814 0h572.249302l283.386047 402.455814-19.527442 13.812093L1023.76186 23.813953H476.755349L224.327442 420.792558z"
              fill="#DDDDDD"
              p-id="6723"
            ></path>
            <path
              d="M1252.613953 881.116279H271.47907A57.391628 57.391628 0 0 1 214.325581 823.962791V414.362791c16.431628-33.815814 26.195349-45.246512 57.629768-45.246512h270.288372c25.242791 0 22.385116 20.956279 22.385116 20.956279s1.905116 71.44186 2.381396 86.92093 19.527442 12.859535 19.527441 12.859535l382.690233 1.428837s20.956279 4.048372 21.194419-12.859534 4.286512-88.349767 4.286511-88.349768a25.242791 25.242791 0 0 1 25.71907-20.956279h229.566512c31.434419 0 59.534884 23.813953 59.534883 45.246512v409.6A57.391628 57.391628 0 0 1 1252.613953 881.116279z"
              fill="#FAFAFA"
              p-id="6724"
            ></path>
            <path
              d="M1252.613953 893.023256H271.47907a69.060465 69.060465 0 0 1-69.060465-69.060465V409.123721C221.231628 372.450233 234.567442 357.209302 271.955349 357.209302h270.288372a34.292093 34.292093 0 0 1 27.147907 10.716279 31.434419 31.434419 0 0 1 7.144186 23.813954s1.905116 68.822326 2.381395 84.777674c0 1.666977 4.048372 1.905116 5.47721 1.428838l385.071628 1.190697a18.574884 18.574884 0 0 0 9.287441 0c0-17.622326 3.810233-86.682791 4.048372-89.778604A36.911628 36.911628 0 0 1 1020.427907 357.209302h229.328372c36.673488 0 71.44186 27.862326 71.441861 57.153489v409.6a69.060465 69.060465 0 0 1-68.584187 69.060465z m-1026.381395-476.27907v407.218605a45.246512 45.246512 0 0 0 45.246512 45.246511h981.134883a45.246512 45.246512 0 0 0 45.246512-45.246511V414.362791c0-13.097674-21.432558-33.339535-47.627907-33.339535h-229.804651a12.859535 12.859535 0 0 0-14.288372 10.716279s-4.048372 70.251163-4.048372 86.444651a23.813953 23.813953 0 0 1-8.573023 19.051163 34.530233 34.530233 0 0 1-26.671628 5.477209l-381.023256-1.190698a29.767442 29.767442 0 0 1-23.813954-5.477209 23.813953 23.813953 0 0 1-8.811162-18.813023c0-16.431628-2.381395-86.92093-2.381396-86.92093a9.763721 9.763721 0 0 0-1.428837-6.667907 13.097674 13.097674 0 0 0-9.287442-2.381396H271.955349c-23.575814-0.23814-30.72 5.23907-45.722791 35.95907z"
              fill="#DDDDDD"
              p-id="6725"
            ></path>
          </svg>
          <h3 className="text-xl font-semibold mb-4">暂无文章列表</h3>
          <p className="text-sm">
            当前分类没有文章可供显示，请尝试一下其它分类。
          </p>
        </div>
      )
    )
  }

  const renderArticleList = () => {
    return articleList.map(article => (
      <article
        onClick={() => toDetailPage(article.articleId)}
        key={article.articleId}
        className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <img
            src={article.image}
            alt={article.title}
            className="w-full md:w-32 h-48 md:h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <time>{article.createTime?.split(' ')[0]}</time>
              <div className="flex gap-1">
                {article.articleCategoryList?.map((cat, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200 rounded-full text-xs"
                  >
                    {cat.categoryName}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
              {article.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {article.excerpt}
            </p>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors">
              阅读全文 →
            </button>
          </div>
        </div>
      </article>
    ))
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
