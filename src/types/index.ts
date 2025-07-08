export interface ArticleCategory {
  categoryId: number // 分类id
  iconClass: string // 分类图标
  categoryName: string // 分类名称
  parentId: number // 父id
  articleTotal: number //分类下的文章总数
  children?: ArticleCategory[] // 子列表
}

export interface ArticleTag {
  articleTagId: number // 标签id
  articleTagName: string // 标签内容
}

export interface Article {
  articleId: number // 文章id
  title: string // 标题
  markdown: string // 内容
  image: string // 图片
  tagIds: number[] // 标签ids
  categoryIds: number[] // 分类ids
  excerpt: string // 摘要
  createTime: string // 更新时间
  articleTagList?: ArticleTag[] // 文章所属分tag列表
  articleCategoryList?: ArticleCategory[] // 文章所属分类
}

export interface BlogAuthor {
  userId: number // 用户id
  fullName: string // 用户名
  avatar: string // 用户头像
  position: string // 用户职位
  selfIntroduction: string // 个人简介
  email: string //个人邮箱
  website: string //个人网址
  github: string //个人github
  phone: string //个人电话
  userNick: string //用户昵称
  birthday: string //生日
  educationLevel: string //学历
  schoolName: string //学校名称
}

// 博客使命
export type MissionPoint = { missionPoint: string }
export interface BlogMission {
  missionId: number // 博客使命id
  missionTitle: string // 使命标题
  missionDescription: string // 使命描述
  missionPointListStr: string // 具体使命要点
  missionPointList?: MissionPoint[] // 具体使命要点列表 前端扩展字段
}

// 经历与成就
export type Achievement = { achievement: string }
export interface JobExperience {
  id: number // id
  title: string // 经历或成就的标题
  titleIcon: string // 标题icon图标类
  organization: string // 所属组织
  timeRange: string // 时间范围
  achievementListStr: string // 具体的成就字符串
  achievementList?: Achievement[] //  具体的成就列表 前端扩展字段
}

// 分页返回数据属性接口
export interface PageResult<T> {
  /**
   * 总条数
   */
  total: number
  /**
   * 页大小
   */
  size: number
  /**
   * 当前页码
   */
  current: number
  /**
   * 总页数
   */
  pages: number
  /**
   * 返回数据列表
   */
  records: T[]
}

/**
 * home页面 分页查询文章列表参数
 */
export interface HomePageQueryArticleListParams {
  publishDateStr?: string // 发布日期
  articleTagId?: number // 标签ID
  pageNum: number // 当前页码
  pageSize: number // 页大小
}

/**
 * category页面 分页查询文章列表参数
 */
export interface CategoryPageQueryArticleListParams {
  categoryIds?: number[] // 分类Id列表
  pageNum: number // 当前页码
  pageSize: number // 页大小
}

/**
 * 联系方式数据类型
 */
export interface ContactMethodType {
  name: string
  value: string
  iconClass: string
  url?: string
}
