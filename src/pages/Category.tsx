import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfiniteScroll } from 'antd-mobile'

import useDeviceType from '@/hooks/useDeviceType'

import {
  queryCategoryPageArticleList,
  queryCategoryListWithArticleCount,
} from '@/api'

import type {
  Article,
  ArticleCategory,
  CategoryPageQueryArticleListParams as QueryParams,
} from '@/types'

import IconFont from '@/components/IconFont'

import { deduplicateArticles } from '@/utils/ArrayUtils'

const ROOT_CATEGORY_ID = 1 // 树根节点id为1 查询分类列表不需要查出树根
const PC_PageSize = 4 //PC端默认页大小
const Mobile_PageSize = 4 //移动端默认页大小

export default function BlogCategoryPage() {
  const isMobile = useDeviceType()
  const navigate = useNavigate()
  const [selectedPath, setSelectedPath] = useState<string[]>([])
  const [articleCategoryTreeList, setArticleCategoryTreeList] = useState<
    ArticleCategory[]
  >([]) // 分类树列表
  const [articleCategoryList, setArticleCategoryList] = useState<
    ArticleCategory[]
  >([]) // 分类列表 树转换的列表
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({}) // 展开/折叠的分类
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null) // 激活的分类id 高亮
  const [articleList, setArticleList] = useState<Article[]>([]) // 文章数据
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: 2,
    pageNum: 1,
    categoryIds: [], // 点击的分类id列表 包含子分类
  }) // 文章列表
  const [totalPage, setTotalPage] = useState<number>(0) // 总分页数
  const [currentPage, setCurrentPage] = useState<number>(0) // 当前页码
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 设置页大小 根据不同设备端
  useEffect(() => {
    const pageSize = isMobile ? Mobile_PageSize : PC_PageSize
    setQueryParams(pre => ({ ...pre, pageSize }))
  }, [isMobile])

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
        setExpandedCategories(allCollapsed)
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
  }, [isMobile, articleCategoryList])

  // 查询分类树 数据
  useEffect(() => {
    const searchCategoryListWithArticleCount = async () => {
      try {
        const res = await queryCategoryListWithArticleCount(ROOT_CATEGORY_ID)
        if (res.data && Array.isArray(res.data)) {
          const treeCategoryList = res.data
          setArticleCategoryTreeList(treeCategoryList)
          setArticleCategoryList(treeDataToListData(treeCategoryList))
          // 默认激活第一个分类
          if (treeCategoryList.length > 0) {
            setActiveCategoryId(treeCategoryList[0].categoryId)
            setSelectedPath([treeCategoryList[0].categoryName])
          }
        } else {
          // 如果没有根节点或根节点没有子分类，设置为空数组
          setArticleCategoryTreeList([])
        }
      } catch (error) {
        console.error(error)
      }
    }
    searchCategoryListWithArticleCount()
  }, [])

  // 查询文章列表
  useEffect(() => {
    const getArticleList = async () => {
      try {
        const res = await queryCategoryPageArticleList(queryParams)
        // 更新总页数和当前页
        setTotalPage(res.data.pages)
        setCurrentPage(res.data.current)
        if (isMobile) {
          //刷新或初始化查询
          if (queryParams.pageNum === 1) {
            setArticleList(res.data.records)
          } else {
            // 追加新数据
            // setArticleList(pre => [...pre, ...res.data.records])
            setArticleList(pre => {
              const newArticles = res.data.records || []
              const uniqueArticles = deduplicateArticles(pre, newArticles)
              return uniqueArticles
            })
          }
          // 判断是否还有更多数据
          setHasMore(res.data.current < res.data.pages)
        } else {
          // PC端
          setArticleList(res.data.records)
        }
      } catch (error) {
        console.error('queryArticleList:', error)
      } finally {
        setLoading(false)
      }
    }
    getArticleList()
  }, [isMobile, queryParams])

  // 将树形结构的分类数据转换为扁平化的列表数据
  const treeDataToListData = (
    treeData: ArticleCategory[],
  ): ArticleCategory[] => {
    const listData: ArticleCategory[] = []

    // 递归遍历树形结构
    const traverse = (categories: ArticleCategory[]): void => {
      categories.forEach(category => {
        // 创建一个新对象，去除 children 属性
        const { children, ...categoryWithoutChildren } = category
        listData.push(categoryWithoutChildren) // 将去除 children 的分类添加到列表中
        if (category.children && category.children.length > 0) {
          traverse(category.children) // 递归处理子分类
        }
      })
    }

    traverse(treeData) // 从顶层分类开始递归遍历
    return listData
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

  // 收集该分类及所有子分类的 categoryId
  const collectCategoryIds = (category: ArticleCategory): number[] => {
    const ids: number[] = [category.categoryId] // 初始化数组，包含当前分类的 categoryId

    // 递归收集子分类的 categoryId
    const traverse = (categories: ArticleCategory[]): void => {
      categories.forEach(child => {
        ids.push(child.categoryId) // 将子分类的 categoryId 添加到数组中
        if (child.children && child.children.length > 0) {
          traverse(child.children) // 递归处理子分类
        }
      })
    }

    if (category.children && category.children.length > 0) {
      traverse(category.children) // 从当前分类的子分类开始递归
    }

    return ids // 返回包含当前分类及所有子分类的 categoryId 数组
  }

  // ! 分页按钮被被点击
  const handlePageButtonClick = (pageNum: number) => {
    setQueryParams(pre => ({ ...pre, pageNum }))
  }

  // !处理分类点击事件
  const handleCategoryClick = (category: ArticleCategory) => {
    //  1、更新激活状态
    setActiveCategoryId(category.categoryId)

    // 2、获取分类的完整路径
    const fullPath = getCategoryPath(category, articleCategoryList)
    setSelectedPath(fullPath)

    // 2、收集该分类及所有子分类ids
    const categoryIds = collectCategoryIds(category)
    setQueryParams(pre => ({ ...pre, categoryIds, pageNum: 1 }))
  }

  //  ! 上拉加载更多事件
  const handleLoadMore = async () => {
    if (loading) return
    console.log('上拉加载更多')
    setLoading(true)
    if (!loading && hasMore) {
      setQueryParams(prev => ({
        ...prev,
        pageNum: prev.pageNum + 1,
      }))
    }
  }

  // !跳转文章详情
  const toDetailPage = (articleId: number) => {
    // navigate('/detail', { state: { articleId } }) // 需要修改路由
    navigate(`/detail/${articleId}`)
  }

  // !切换分类展开/折叠状态
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
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
        {selectedPath.map((path, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            <span
              className={`text-sm dark:text-gray-300 ${index === selectedPath.length - 1 ? 'font-medium' : ''}`}
            >
              {path}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // 渲染文章列表
  const renderArticleList = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
        {/* 无文章列表 */}
        {articleList.length === 0 ? (
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
              当前没有文章可供显示。请稍后再来查看，或者尝试其他分类。
            </p>
          </div>
        ) : (
          articleList.map(article => (
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
                      {article.updateTime?.split(' ')[0]}{' '}
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
        )}
      </div>
    )
  }

  // PC端分页按钮组件
  const renderPcPagination = () => {
    return (
      <div className="mt-6 flex justify-center">
        <div className="flex gap-2">
          {/* 第一页按钮 - 始终显示（除非只有一页） */}
          {totalPage > 1 && (
            <button
              onClick={() => handlePageButtonClick(1)}
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
            <span className="w-10 h-10 flex items-center justify-center">
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
                  onClick={() => handlePageButtonClick(page)}
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
            <span className="w-10 h-10 flex items-center justify-center">
              ...
            </span>
          )}

          {/* 最后一页按钮 - 始终显示（除非只有一页） */}
          {totalPage > 1 && (
            <button
              onClick={() => handlePageButtonClick(totalPage)}
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

  return (
    <div className="md:flex md:gap-8 max-w-7xl mx-auto px-4 py-6">
      {/* 分类侧边栏 */}
      {renderLeftCategory()}

      {/* 主内容区 */}
      <div className="flex-1">
        {/* 当前路径 */}
        {renderBreadcrumb()}

        {/* 文章列表 */}
        {renderArticleList()}

        {/* 分页 移动端下拉加载更多 pc端显示分页按钮*/}
        {isMobile ? (
          <InfiniteScroll
            loadMore={handleLoadMore}
            hasMore={hasMore}
            threshold={50}
          />
        ) : (
          renderPcPagination()
        )}
      </div>
    </div>
  )
}
