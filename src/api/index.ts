import request from '@/utils/request'
import type {
  ArticleTag,
  ArticleCategory,
  Article,
  BlogAuthor,
  BlogMission,
  JobExperience,
  PageResult,
  HomePageQueryArticleListParams,
  CategoryPageQueryArticleListParams,
} from '@/types'

// 标签部分
/**
 * 查询标签列表
 * @returns
 */
export const queryArticleTagList = () =>
  request.get<ArticleTag[]>('/articleTag/list')

// 分类部分
export const queryCategoryListWithArticleCount = (parentId?: number) =>
  request.get<ArticleCategory[]>(
    '/articleCategory/categoryListWithArticleCount',
    { parentId: parentId },
  )
export const queryArticleCategoryTotal = () =>
  request.get<number>('/articleCategory/total')

// 文章部分
/**
 * 查询文章发布日期类列表
 * @returns
 */
export const queryArticlePublishDateList = () =>
  request.get<string[]>('/article/publishDateList')
/**
 * 查询文章总条数
 * @returns
 */
export const queryArticleTotal = () => request.get<number>('/article/total')
/**
 * 查询文章详情
 * @param articleId
 * @returns
 */
export const queryArticleById = (articleId: number) =>
  request.get<Article>('/article/articleDetailById', { articleId })
/**
 * 首页 条件分页查询 文章列表
 * @param params
 * @returns
 */
export const queryHomePageArticleList = (
  params: HomePageQueryArticleListParams,
) =>
  request.get<PageResult<Article>>('/article/mobileHomePageArticleList', params)

export const queryArticleList = () => request.get<Article[]>('/article/list')
/**
 * 分类页面 条件分页查询 文章列表
 * @param params
 * @returns
 */
export const queryCategoryPageArticleList = (
  params: CategoryPageQueryArticleListParams,
) =>
  request.get<PageResult<Article>>(
    '/article/mobileCategoryPageArticleList',
    params,
  )

// 博客作者信息
export const queryBlogAuthor = () =>
  request.get<BlogAuthor>('/blogAuthor/currentUserInfo')

// 博客使命
export const queryBlogMission = () =>
  request.get<BlogMission>('/blogMission/blogMissionInfo')

// 经历与成就
export const queryJobExperienceList = () =>
  request.get<JobExperience[]>('/jobExperience/list')
