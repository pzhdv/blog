import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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

const ROOT_CATEGORY_ID = 1 // 树根节点id为1 查询分类列表不需要查出树根
const PC_PageSize = 2 //PC端默认页大小
const Mobile_PageSize = 4 //移动端默认页大小

export default function BlogCategoryPage() {
  const isMobile = useDeviceType()
  const navigate = useNavigate()

  const {
    articleCategoryTreeList, // 分类树列表，表示文章分类的层级结构
    articleCategoryList, // 分类列表，将分类树转换为扁平化的列表

    hasInitSearch, // 是否已经初始化查询过了
    initFetch, // 初始化查询 查询分类树 查询文章列表

    articleList, // 文章列表，存储当前分类下的文章
    totalPage, // 总分页数，表示文章列表的总页数
    currentPage, // 当前页码，用于分页显示文章
    hasMore, // 是否还有更多文章，用于支持“加载更多”功能
    loading, // 加载状态，表示是否正在加载数据
    queryArticleList, // 查询文章列表的方法
    loadMore, // 加载更多文章的方法

    isFromDetailPage, // 是否是从详情页面返回，用于处理返回逻辑
    setIsFromDetailPage, // 设置是否是从详情页面返回

    expandedCategories, // 展开/折叠的分类，记录哪些分类被展开或折叠
    setExpandedCategories, // 设置展开/折叠的分类

    activeCategoryId, // 当前激活的分类 ID，用于标识当前选中的分类
    setActiveCategoryId, // 设置当前激活分类的Id

    currentCategoryPathList, // 当前路径，表示用户在分类树中选择的路径
    setCurrentCategoryPathList, // 设置当前路径

    scrollTop, // 滚动高度，用于记录用户滚动的位置
    setScrollTop, // 设置滚动高度

    hasQueryArticleList, // 是否已经查询过文章列表，用于避免重复查询
  } = useCategoryStore()

  const previousIsMobileRef = useRef(isMobile) // 使用 useRef 跟踪上一次的设备状态，避免不必要的重新渲染
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: isMobile ? Mobile_PageSize : PC_PageSize,
    pageNum: currentPage,
    categoryIds: [], // 点击的分类id列表(包含子分类id)
  })

  // 初始化查询
  useEffect(() => {
    if (!hasInitSearch) {
      initFetch(ROOT_CATEGORY_ID, queryParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitSearch, queryParams])

  // 实时响应式PC-移动 查询文章列表
  useEffect(() => {
    const isFirstLoading = !hasQueryArticleList // 是否是第一次加载
    const deviceTypeHasChanged =
      hasQueryArticleList && isMobile !== previousIsMobileRef.current // 设备是否切换

    // 如果两个条件都不满足，则什么都不做
    if (!isFirstLoading && !deviceTypeHasChanged) {
      return
    }

    //  更新设备状态
    previousIsMobileRef.current = isMobile

    // 准备新的查询参数并调用查询函数
    const newParams = {
      pageSize: isMobile ? Mobile_PageSize : PC_PageSize,
      pageNum: 1, // 切换设备时、或第一次查询,重置到第一页
    }
    setQueryParams(newParams) // 更新本地 state
    queryArticleList(newParams) // 调用查询函数查询文章列表
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQueryArticleList, isMobile])

  // 处理分类树默认展开折叠 PC - 全部展开  Mobile - 全部折叠
  useEffect(() => {
    const handleCategoriesExpansion = () => {
      if (isMobile) {
        // Mobile - 全部折叠
        const allCollapsed = articleCategoryList.reduce(
          (acc, category) => {
            acc[category.categoryId] = false
            return acc
          },
          {} as Record<string, boolean>,
        )
        setExpandedCategories({ ...allCollapsed, ...expandedCategories })
      } else {
        // PC - 全部展开
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
    // 处理展开折叠
    handleCategoriesExpansion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, articleCategoryList])

  // 处理位置
  useEffect(() => {
    // 如果是移动端
    if (isMobile) {
      // 如果是从详情页面返回的，则滚动到离开页面之前的位置
      if (isFromDetailPage) {
        window.scrollTo(0, scrollTop)
      } else {
        // 否则，滚动到顶部
        window.scrollTo(0, 0)
      }
    }
    // 在组件卸载时，重置 isFromDetailPage 状态
    return () => {
      setIsFromDetailPage(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, scrollTop, isFromDetailPage])

  // todo 通用的更新查询参数和文章列表请求
  const updateAndRefetch = (newQueryPart: Partial<QueryParams>) => {
    // 将新的查询参数部分与旧的参数合并
    const newParams = { ...queryParams, ...newQueryPart }

    // 更新查询参数
    setQueryParams(newParams)

    // 使用最新的参数去请求文章列表
    queryArticleList(newParams)
  }

  // 获取分类的完整路径
  const getCategoryPath = (
    category: ArticleCategory,
    allCategories: ArticleCategory[],
  ): string[] => {
    const path: string[] = [category.categoryName] // 初始化路径，包含当前分类名称

    // 递归查找父级分类
    const findParentPath = (categoryId: number): void => {
      const parentCategory = allCategories.find(
        cat => cat.categoryId === categoryId,
      )
      if (parentCategory) {
        path.unshift(parentCategory.categoryName) // 将父级分类名称添加到路径的开头
        findParentPath(parentCategory.parentId) // 继续递归查找上一级父级分类
      }
    }

    // 从当前分类的父级分类开始递归查找路径
    if (category.parentId) {
      findParentPath(category.parentId)
    }

    return path // 返回完整的路径
  }

  // ! 分页按钮被被点击
  const handlePageButtonClick = (pageNum: number) => {
    updateAndRefetch({ pageNum })
  }

  // !处理分类点击事件
  const handleCategoryClick = (category: ArticleCategory) => {
    // 1、获取分类的完整路径
    const fullPath = getCategoryPath(category, articleCategoryList)
    setCurrentCategoryPathList(fullPath)

    //  2、更新激活Id
    setActiveCategoryId(category.categoryId)

    // 3、获取当前分类及子分类的id列表 用于按分类查询文章列表
    const categoryIds = collectCategoryIds(category)

    //  4、跟新数据并且查询文章列表 从第一页开始
    updateAndRefetch({ categoryIds, pageNum: 1 })
  }

  //  ! 上拉加载更多事件
  const handleLoadMore = async () => {
    if (loading) return
    loadMore(queryParams)
  }

  // !跳转文章详情
  const toDetailPage = (articleId: number) => {
    setScrollTop(window.scrollY) // 保存离开之前滚动位置
    navigate(`/detail/${articleId}`, { state: { from: 'category' } })
  }

  // !切换分类展开/折叠状态
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    })
  }

  // 渲染左侧分类
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

  // 分类树渲染
  const renderCategoryTree = (items: ArticleCategory[], level = 0) => {
    return items.map(category => (
      <div
        key={category.categoryId}
        className={`relative ${level > 0 ? 'ml-4' : ''}`}
        onClick={e => e.stopPropagation()} // 阻止事件冒泡
      >
        <div className="flex items-center gap-2">
          {/* 主点击区域 */}
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
              ${activeCategoryId === category.categoryId ? 'bg-purple-100 text-purple-600 dark:bg-purple-800/70 dark:text-purple-200' : ''}`} // 动态切换激活样式
          >
            <span className="dark:text-gray-400">
              <IconFont iconClass={category.iconClass} size={20} />
            </span>
            <span className="truncate">{category.categoryName}</span>
            <span className="text-xs text-gray-500 ml-auto dark:text-gray-200">
              {category.articleTotal}
            </span>
          </button>

          {/* 展开/折叠按钮 */}
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

        {/* 子分类容器 */}
        {category.children && expandedCategories[category.categoryId] && (
          <div className="mt-1 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // 渲染当前分类路径
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

  // 渲染文章空列表显示状态
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
  // 渲染文章列表
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
              <time>
                {article.createTime?.split(' ')[0]}{' '}
                {/* "2025-05-06 01:42:09" */}
              </time>
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

  return (
    <div className="md:flex md:gap-8 max-w-7xl mx-auto px-4 py-6 min-h-[90vh] md:min-h-[50vh]">
      {/* 分类侧边栏 */}
      {renderLeftCategory()}

      {/* 主内容区 */}
      <div className="flex-1">
        {/* 当前路径 */}
        {renderBreadcrumb()}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          {/* 渲染空列表为空显示 */}
          {renderArticleListEmpty()}
          {/* 文章列表 */}
          {renderArticleList()}
        </div>

        {/* 分页 移动端下拉加载更多 pc端显示分页按钮*/}
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
    </div>
  )
}
