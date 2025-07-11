import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useDeviceType from '@/hooks/useDeviceType'

import type { HomePageQueryArticleListParams as QueryParams } from '@/types'

import { useHomeStore } from '@/store'

import BlogCalendar from '@/components/BlogCalendar'
import PcPagination from '@/components/PcPagination'
import InfiniteScroll from '@/components/InfiniteScroll'

const PC_PageSize = 4 //PC端默认页大小
const Mobile_PageSize = 5 //移动端默认页大小

export default function BlogHomepage() {
  const {
    hasQueryRightSiderData, // 是否已经查询过了右侧数据，用于避免重复查询
    blogAuthor, // 作者个人信息，包含作者的基本信息
    articleTotal, // 文章总条数，用于显示文章总数
    articleCategoryTotal, // 文章分类总条数，用于显示分类总数
    articlePublishDateList, // 文章发布时间列表，用于显示文章的发布时间
    tagList, // 标签数据列表，用于显示文章标签
    queryRightSiderData, // 查询右侧侧边栏数据的方法

    articleList, // 文章列表，存储当前分类下的文章
    totalPage, // 总分页数，表示文章列表的总页数
    currentPage, // 当前页码，用于分页显示文章
    hasMore, // 是否还有更多文章，用于支持“加载更多”功能
    loading, // 加载状态，表示是否正在加载数据
    queryArticleList, // 查询文章列表的方法
    loadMore, // 加载更多文章的方法

    hasQueryArticleList, // 是否已经查询过了文章列表数据，防止文章详情返回再次查询

    scrollTop, // 滚动高度，用于记录用户滚动的位置
    setScrollTop, // 设置滚动高度的方法

    isFromDetailPage, // 是否是从详情页面返回，用于处理返回逻辑
    setIsFromDetailPage, // 设置是否是从详情页面返回的方法
  } = useHomeStore()
  const navigate = useNavigate()
  const isMobile = useDeviceType()
  const previousIsMobileRef = useRef(isMobile) // 使用 useRef 跟踪上一次的设备状态，避免不必要的重新渲染
  const [activeTagId, setActiveTagId] = useState<number>() // 激活的标签Id
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pageSize: isMobile ? Mobile_PageSize : PC_PageSize,
    pageNum: currentPage,
  })

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

  // 查询右边侧边栏数据
  useEffect(() => {
    // 查询侧边栏数据（仅PC端）
    if (isMobile) return
    if (!hasQueryRightSiderData) queryRightSiderData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, hasQueryRightSiderData])

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

  //  ! 上拉加载更多
  const handleLoadMore = async () => {
    if (loading) return
    loadMore(queryParams)
  }

  // ! 日期组件日期点击事件
  const onDayClick = (publishDateStr: string) => {
    updateAndRefetch({ publishDateStr, pageNum: 1 })
  }

  //  ! 标签点击事件
  const handleTagClick = (articleTagId: number) => {
    setActiveTagId(articleTagId)
    updateAndRefetch({ articleTagId, pageNum: 1 })
  }

  // ! 分页按钮被被点击
  const handlePageButtonClick = (pageNum: number) => {
    updateAndRefetch({ pageNum })
  }

  // ! 跳转文章详情
  const toDetailPage = (articleId: number) => {
    setScrollTop(window.scrollY) // 保存离开之前滚动位置
    navigate(`/detail/${articleId}`, { state: { from: 'home' } })
  }

  // 渲染空组件
  const renderEmpty = () => {
    return (
      !loading &&
      articleList.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-20 h-20 mb-4 mx-auto"
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
          <p className="text-lg font-medium">暂无文章可供显示，请稍后再来！</p>
        </div>
      )
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
              loading="lazy"
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
                  {article.createTime?.split(' ')[0]}{' '}
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
    <div className={`grid md:grid-cols-3 gap-8  min-h-[90vh] md:min-h-0`}>
      {/* 文章列表 - col-span-2:占父盒子大小2份布局 */}
      <div className="md:col-span-2 ">
        {/* 空列表显示 */}
        {renderEmpty()}
        {/* 文章列表 */}
        {renderArticleList()}
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
