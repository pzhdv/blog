import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useDeviceType from '@/hooks/useDeviceType'

import {
  queryHomePageArticleList,
  queryBlogAuthor,
  queryArticleTotal,
  queryArticleTagList,
  queryArticleCategoryTotal,
  queryArticlePublishDateList,
} from '@/api'

import type {
  ArticleTag,
  Article,
  BlogAuthor,
  HomePageQueryArticleListParams as QueryParams,
} from '@/types'

import { deduplicateArticles } from '@/utils/ArrayUtils'

import BlogCalendar from '@/components/BlogCalendar'
import PcPagination from '@/components/PcPagination'
import InfiniteScroll from '@/components/InfiniteScroll'

const PC_PageSize = 4 //PC端默认页大小
const Mobile_PageSize = 2 //移动端默认页大小

export default function BlogHomepage() {
  const isMobile = useDeviceType()
  const navigate = useNavigate()
  const [blogAuthor, setBlogAuthor] = useState<BlogAuthor | null>(null) // 作者个人信息
  const [articleTotal, setArticleTotal] = useState<number>() // 文章总条数
  const [articleCategoryTotal, setArticleCategoryTotal] = useState<number>() // 文章分类总条数
  const [articlePublishDateList, setArticlePublishDateList] = useState<
    { date: Date }[]
  >([]) // 文章发布时间列表
  const [tagList, setTagList] = useState<ArticleTag[]>([]) // 标签数据列表
  const [activeTagId, setActiveTagId] = useState<number>() // 激活的标签Id
  const [articleList, setArticleList] = useState<Article[]>([]) // 文章列表
  const [totalPage, setTotalPage] = useState<number>(0) // 总分页数
  const [currentPage, setCurrentPage] = useState<number>(0) // 当前页码
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: PC_PageSize,
    pageNum: 1,
  }) // 查询参数对象
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  // 查询右边侧边栏数据
  useEffect(() => {
    // 查询侧边栏数据（仅PC端）
    const fetchSidebarData = async () => {
      try {
        // 使用 Promise.all 并行请求，提高性能
        const [tagRes, authorRes, totalRes, categoryRes, dateRes] =
          await Promise.all([
            // 查询标签数据列表
            queryArticleTagList(),
            // 查询作者个人信息
            queryBlogAuthor(),
            // 查询文章总条数
            queryArticleTotal(),
            // 查询文章分类总条数
            queryArticleCategoryTotal(),
            // 查询文章发布时间列表
            queryArticlePublishDateList(),
          ])

        setTagList(tagRes.data)
        setBlogAuthor(authorRes.data)
        setArticleTotal(totalRes.data)
        setArticleCategoryTotal(categoryRes.data)

        const dateList = dateRes?.data?.map(d => ({ date: new Date(d) })) || []
        setArticlePublishDateList(dateList)
      } catch (error) {
        console.error('侧边栏数据请求失败:', error)
      }
    }

    if (isMobile) return // 移动端不需要查询
    fetchSidebarData()
  }, [isMobile])

  // 处理 pageSize 随设备类型变化
  useEffect(() => {
    const pageSize = isMobile ? Mobile_PageSize : PC_PageSize
    setQueryParams(pre => ({ ...pre, pageSize }))
  }, [isMobile])

  // 查询文章列表
  useEffect(() => {
    // 查询文章列表
    const getArticleList = async () => {
      try {
        console.log('查询文章列表')
        const res = await queryHomePageArticleList(queryParams)
        // 更新总页数和当前页
        setTotalPage(res.data.pages)
        setCurrentPage(res.data.current)
        //移动端 数据处理
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
        console.error('queryHomePageArticleList:', error)
      } finally {
        setLoading(false)
      }
    }
    getArticleList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  // ! 日期组件日期点击事件
  const onDayClick = (publishDateStr: string) => {
    setQueryParams(pre => ({ ...pre, publishDateStr }))
  }

  //  ! 标签点击事件
  const handleTagClick = (articleTagId: number) => {
    setActiveTagId(articleTagId)
    setQueryParams(pre => ({ ...pre, articleTagId }))
  }

  // ! 跳转文章详情
  const toDetailPage = (articleId: number) => {
    // navigate('/detail', { state: { articleId } }) // 需要修改路由
    navigate(`/detail/${articleId}`)
  }

  // ! 分页按钮被被点击
  const handlePageButtonClick = (pageNum: number) => {
    setQueryParams(pre => ({ ...pre, pageNum }))
  }

  //  ! 上拉加载更多
  const handleLoadMore = async () => {
    if (loading) return
    // console.log('上拉加载更多')
    setLoading(true)
    if (!loading && hasMore) {
      setQueryParams(prev => ({
        ...prev,
        pageNum: prev.pageNum + 1,
      }))
    }
  }

  // 渲染空组件
  const renderEmpty = () => {
    // 加载状态 或有文章
    if (loading || articleList.length > 0) {
      return
    }
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-medium">暂无文章，稍后再来看看吧！</p>
      </div>
    )
  }

  // 渲染文章列表
  const renderArticleList = () => {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {articleList.map(article => (
          <article
            onClick={() => toDetailPage(article.articleId as number)}
            key={article.articleId}
            className="rounded-lg overflow-hidden transition-all duration-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-md hover:shadow-xl"
          >
            {/* 封面图片 */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />

            {/* 文章内容 */}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {article.title}
              </h2>
              <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-300">
                {article.excerpt}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {article.updateTime?.split(' ')[0]}{' '}
                  {/* "2025-05-06 01:42:09" */}
                </span>
                <button className="ml-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  阅读全文 →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )
  }

  // 渲染作者信息模块
  const renderAuthorInfo = () => {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm bg-white text-gray-800  dark:bg-gray-800 dark:text-gray-100`}
      >
        {/* 作者头部信息 */}
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

        {/* 作者介绍 */}
        <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {blogAuthor?.selfIntroduction}
        </p>

        {/* 数据统计 */}
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

  // 渲染tag列表
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
                          ? 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-900'
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
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* 文章列表 - col-span-2:占父盒子大小2份布局 */}
      <div className="md:col-span-2 ">
        {/* 空列表显示 */}
        {renderEmpty()}
        {/* 文章列表 */}
        {renderArticleList()}
        {/* 分页 移动端下拉加载更多 pc端显示分页按钮*/}
        {isMobile ? (
          <InfiniteScroll
            loadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
            threshold={50}
          />
        ) : (
          <PcPagination
            totalPage={totalPage}
            currentPage={currentPage}
            onClick={handlePageButtonClick}
          />
        )}
      </div>

      {/* 侧边栏  col-span-2:占父盒子大小1份布局*/}
      <aside className="space-y-8 hidden md:block ">
        {/* 作者简介*/}
        {renderAuthorInfo()}
        {/* 日历组件 */}
        <BlogCalendar posts={articlePublishDateList} onDayClick={onDayClick} />
        {/* 标签列表 */}
        {renderTagList()}
      </aside>
    </div>
  )
}
