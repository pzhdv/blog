import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  queryCategoryListWithArticleCount,
  queryCategoryPageArticleList,
} from '@/api'
import type {
  Article,
  ArticleCategory,
  CategoryPageQueryArticleListParams as QueryParams,
} from '@/types'
import {
  treeDataToListData,
  collectCategoryIds,
} from '@/utils/categoryPageUtils'

// 定义状态类型
type State = {
  hasInitSearch: boolean // 是否已经初始化查询过了

  articleCategoryTreeList: ArticleCategory[] // 分类树列表，表示文章分类的层级结构
  articleCategoryList: ArticleCategory[] // 分类列表，将分类树转换为扁平化的列表
  activeCategoryId: number | undefined // 当前激活的分类 ID，用于标识当前选中的分类
  categoryIds: number[] // 分类Id列表 保存当前分类及子分类的id列表 用于查询该分类文章
  currentCategoryPathList: string[] // 当前路径，表示用户在分类树中选择的路径
  expandedCategories: Record<string, boolean> // 展开/折叠的分类，记录哪些分类被展开或折叠

  // 文章数据
  hasQueryArticleList: boolean // 是否已经查询过文章列表，避免重复查询
  articleList: Article[] // 文章列表，存储当前分类下的文章
  currentPage: number // 当前页码，用于分页显示文章
  totalPage: number // 总分页数，表示文章列表的总页数
  loading: boolean // 是否正在加载数据，用于显示加载动画
  hasMore: boolean // 是否还有更多文章，用于支持“加载更多”功能
  scrollTop: number // 滚动高度，用于记录用户滚动的位置

  isFromDetailPage: boolean // 是否是从详情页面返回，用于处理返回逻辑
}

// 定义操作类型
type Actions = {
  initFetch: (parentId: number, queryParams: QueryParams) => void // 初始化查询 查询分类树 查询文章列表

  setActiveCategoryId: (activeCategoryId: number) => void // 设置当前激活分类的Id

  setCurrentCategoryPathList: (currentCategoryPathList: string[]) => void // 设置当前路径
  setExpandedCategories: (expandedCategories: Record<string, boolean>) => void // 设置展开/折叠的分类

  queryArticleList: (queryParams: QueryParams) => void // 查询文章列表，根据查询参数获取文章
  loadMore: (queryParams: QueryParams) => void // 加载更多文章，根据查询参数获取更多文章
  setScrollTop: (scrollTop: number) => void // 设置滚动高度

  setIsFromDetailPage: (isFromDetailPage: boolean) => void // 设置是否是从详情页面返回
}

// 初始状态
const initialState: State = {
  hasInitSearch: false,

  categoryIds: [],

  articleCategoryTreeList: [],
  articleCategoryList: [],
  activeCategoryId: undefined,
  currentCategoryPathList: [],
  expandedCategories: {},

  hasQueryArticleList: true,
  articleList: [],
  currentPage: 1,
  totalPage: 0,
  loading: true,
  hasMore: false,
  scrollTop: 0,

  isFromDetailPage: false,
}

// 创建分类页面数据store 核心逻辑
const storeCreator: StateCreator<State & Actions> = (set, get) => ({
  ...initialState,

  setActiveCategoryId: activeCategoryId => {
    set({ activeCategoryId })
  },
  setCurrentCategoryPathList: currentCategoryPathList => {
    set({ currentCategoryPathList })
  },
  setExpandedCategories: expandedCategories => {
    set({ expandedCategories })
  },

  setScrollTop: scrollTop => {
    set({ scrollTop })
  },
  setIsFromDetailPage: isFromDetailPage => {
    set({ isFromDetailPage })
  },

  initFetch: async (parentId, queryParams) => {
    try {
      console.log('查询分类及文字列表')
      const res = await queryCategoryListWithArticleCount(parentId)
      const articleCategoryTreeList = res.data || [] //分类树
      const articleCategoryList = treeDataToListData(articleCategoryTreeList) // 转换后的分类列表

      if (articleCategoryTreeList.length > 0) {
        const activeCategory = articleCategoryTreeList[0] // 默认激活第一个分类
        const activeCategoryId = activeCategory.categoryId // 激活的id
        const currentCategoryPathList = [activeCategory.categoryName] // 当前路径
        const categoryIds = collectCategoryIds(activeCategory) // 收集该分类及所有子分类ids

        //查询文章列表
        const articleRes = await queryCategoryPageArticleList({
          ...queryParams,
          categoryIds,
        })

        const currentPage = articleRes.data.current // 当前页
        const totalPage = articleRes.data.pages // 总页数
        const hasMore = articleRes.data.current < articleRes.data.pages // 判断是否还有更多数据
        const articleList = articleRes.data.records // 文章列表
        // 保存 分类树, 转换后的分类列表, 激活的id,  当前路径, 当前激活分类id含所有子分类ids,当前页,总页数,判断是否还有更多数据,文章列表
        set({
          articleCategoryTreeList,
          articleCategoryList,
          activeCategoryId,
          currentCategoryPathList,
          categoryIds,
          currentPage,
          totalPage,
          hasMore,
          articleList,
          hasInitSearch: true, //已经初始化查询
        })
      }
    } catch (error) {
      console.error('分类页面 查询左侧分类树及文章列表请求失败:', error)
      set({
        hasQueryArticleList: false,
        hasInitSearch: false,
      })
    } finally {
      set({ loading: false })
    }
  },

  queryArticleList: async (queryParams: QueryParams) => {
    try {
      console.log('查询文章列表')
      set({ loading: true })
      const res = await queryCategoryPageArticleList(queryParams)
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
      const res = await queryCategoryPageArticleList(params)
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

// 创建分类页面数据store（生产环境不加devtools）
const useCategoryStore =
  process.env.NODE_ENV === 'development'
    ? create<State & Actions>()(
        devtools(storeCreator, {
          name: 'CategoryStore', // 开发环境显示名称
          enabled: true, // 显式启用（可选）
        }),
      )
    : create<State & Actions>()(storeCreator)

export default useCategoryStore
