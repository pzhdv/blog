import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  queryArticleTagList,
  queryBlogAuthor,
  queryArticleTotal,
  queryArticleCategoryTotal,
  queryArticlePublishDateList,
  queryHomePageArticleList,
} from '@/api'
import type {
  Article,
  ArticleTag,
  BlogAuthor,
  HomePageQueryArticleListParams as QueryParams,
} from '@/types'

// 定义状态类型
type State = {
  // 右边侧边栏数据
  hasQueryRightSiderData: boolean // 是否已经查询过了右侧数据
  blogAuthor: BlogAuthor | null // 作者个人信息
  articleTotal: number // 文章总条数
  articleCategoryTotal: number // 文章分类总条数
  articlePublishDateList: { date: Date }[] // 文章发布时间列表
  tagList: ArticleTag[] // 标签数据列表

  // 文章数据
  hasQueryArticleList: boolean // 是否已经查询过文章列表了
  articleList: Article[] // 文章列表
  currentPage: number // 当前页码
  totalPage: number // 总分页数
  loading: boolean // 是否是加载状态
  hasMore: boolean // 是否还有更多
  scrollTop: number // 滚动高度

  isFromDetailPage: boolean // 是否是从详情页面返回
}

// 定义操作类型
type Actions = {
  queryRightSiderData: () => void // 查询右侧侧边栏数据，包括作者信息、文章总数、分类总数、发布时间列表和标签列表

  queryArticleList: (queryParams: QueryParams) => void // 查询文章列表，根据查询参数获取文章
  loadMore: (queryParams: QueryParams) => void // 加载更多文章，根据查询参数获取更多文章
  setScrollTop: (scrollTop: number) => void // 设置滚动高度

  setIsFromDetailPage: (isFromDetailPage: boolean) => void // 设置是否是从详情页面返回
}

// 初始状态
const initialState: State = {
  hasQueryRightSiderData: false,
  articleTotal: 0,
  articleCategoryTotal: 0,
  blogAuthor: null,
  articlePublishDateList: [],
  tagList: [],

  hasQueryArticleList: false,
  articleList: [],
  currentPage: 1,
  totalPage: 0,
  loading: true,
  hasMore: false,
  scrollTop: 0,

  isFromDetailPage: false,
}

// 创建首页页面数据store 核心逻辑
const storeCreator: StateCreator<State & Actions> = (set, get) => ({
  ...initialState,
  setScrollTop: scrollTop => {
    set({ scrollTop })
  },
  setIsFromDetailPage: isFromDetailPage => {
    set({ isFromDetailPage })
  },
  queryArticleList: async queryParams => {
    try {
      console.log('查询文章列表')
      set({ loading: true })
      const res = await queryHomePageArticleList(queryParams)
      const currentPage = res.data.current //当前页
      const totalPage = res.data.pages //总页数
      const hasMore = res.data.current < res.data.pages // 判断是否还有更多数据
      const articleList = res.data.records // 文章列表
      set({
        totalPage,
        currentPage,
        articleList,
        hasMore,
        hasQueryArticleList: true,
      })
    } catch (error) {
      console.error('查询首页文章列表出错:', error)
    } finally {
      set({ loading: false })
    }
  },
  queryRightSiderData: async () => {
    try {
      console.log('查询右侧侧边栏数据')
      // 并行加载所有数据
      const [authorRes, tagRes, totalRes, categoryRes, dateRes] =
        await Promise.all([
          queryBlogAuthor(),
          queryArticleTagList(),
          queryArticleTotal(),
          queryArticleCategoryTotal(),
          queryArticlePublishDateList(),
        ])

      // 处理文章发布时间列表
      const dateList = dateRes?.data?.map(d => ({ date: new Date(d) })) || []

      // 调用 set 方法进行状态的赋值
      set({
        articleTotal: totalRes.data,
        articleCategoryTotal: categoryRes.data,
        blogAuthor: authorRes.data,
        tagList: tagRes.data,
        articlePublishDateList: dateList,
        hasQueryRightSiderData: true,
        loading: false,
      })
    } catch (error) {
      console.error('侧边栏数据请求失败:', error)
      set({
        hasQueryRightSiderData: false,
      })
    }
  },
  loadMore: async queryParams => {
    try {
      const { loading, currentPage: pageNum } = get()
      if (loading) {
        return
      }
      console.log('上拉加载更多')
      set({ loading: true })
      // 模拟网络延迟 产生加载动画
      await new Promise(resolve => setTimeout(resolve, 500))
      const params = {
        ...queryParams,
        pageNum: pageNum + 1,
      }
      const res = await queryHomePageArticleList(params)
      // 总页数
      const totalPage = res.data.pages
      // 当前页
      const currentPage = res.data.current
      // 判断是否还有更多数据
      const hasMore = res.data.current < res.data.pages
      set(state => ({
        hasMore,
        totalPage,
        currentPage,
        articleList: [...state.articleList, ...res.data.records],
      }))
    } catch (error) {
      console.error('查询更多失败', error)
    } finally {
      set({ loading: false })
    }
  },
})

const useHomeStore =
  process.env.NODE_ENV === 'development'
    ? create<State & Actions>()(
        devtools(storeCreator, {
          name: 'HomeStore', // 开发环境显示名称
          enabled: true, // 显式启用（可选）
        }),
      )
    : create<State & Actions>()(storeCreator)

export default useHomeStore
