import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  queryBlogAuthor,
  queryBlogMission,
  queryJobExperienceList,
} from '@/api'
import type {
  Achievement,
  BlogAuthor,
  BlogMission,
  ContactMethodType,
  JobExperience,
  MissionPoint,
} from '@/types'

// 定义状态类型
type State = {
  blogAuthor: BlogAuthor | null // 作者个人信息
  contactMethodList: ContactMethodType[] // 联系方式列表
  blogMission: BlogMission | null // 博客使命
  jobExperienceList: JobExperience[] // 工作经历
  loading: boolean // 加载状态
  hasQuery: boolean // 是否已经查询过了
}

// 定义操作类型

type Actions = {
  /**
   * 查询个人信息所有数据
   * 1.查询博客作者信息数据
   * 2.查询博客使命信息数据
   * 3.查询工作经历信息列表
   */
  fetchAllData: () => void
}

// 初始状态
const initialState: State = {
  blogAuthor: null,
  contactMethodList: [],
  blogMission: null,
  jobExperienceList: [],
  loading: false,
  hasQuery: false,
}

// 处理博客作者数据
// 将 API 返回的作者数据转换为所需的格式，并生成联系方式列表
const processBlogAuthorData = (data: BlogAuthor) => {
  return {
    blogAuthor: data, // 作者个人信息
    contactMethodList: [
      // 联系方式列表
      {
        name: 'GitHub', // 联系方式名称
        value: data.github, // 联系方式值
        iconClass: 'iconfont icon-github', // 联系方式图标类
        url: data.github, // 联系方式链接
      },
      {
        name: 'Email',
        value: data.email,
        iconClass: 'iconfont icon-email',
      },
      {
        name: 'Phone',
        value: data.phone,
        iconClass: 'iconfont icon-phone',
      },
      {
        name: 'Website',
        value: data.website,
        iconClass: 'iconfont icon-website',
        url: data.website,
      },
    ],
  }
}

// 处理博客使命数据
// 将 API 返回的使命数据中的字符串转换为数组格式
const processBlogMissionData = (data: BlogMission) => {
  const { missionPointListStr } = data // 使命点字符串
  const missionPointList: MissionPoint[] = missionPointListStr // 将字符串转换为数组
    ? missionPointListStr
        .split('&') // 按 '&' 分割字符串
        .filter(Boolean) // 过滤掉空字符串
        .map(missionPoint => ({ missionPoint })) // 转换为数组
    : []
  return { ...data, missionPointList } // 返回包含数组的使命数据
}

// 处理工作经历数据
// 将 API 返回的工作经历数据中的成就字符串转换为数组格式
const processJobExperienceData = (data: JobExperience[]) => {
  return data.map(experience => {
    // 遍历工作经历数组
    const achievementList: Achievement[] = // 将成就字符串转换为数组
      experience.achievementListStr
        ?.split('&') // 按 '&' 分割字符串
        .map(achievement => ({ achievement })) ?? [] // 转换为数组
    return { ...experience, achievementList } // 返回包含数组的工作经历数据
  })
}

// 创建关于页面数据store 核心逻辑
const storeCreator: StateCreator<State & Actions> = set => ({
  ...initialState,
  // 并行加载所有数据
  fetchAllData: async () => {
    set({ loading: true })
    try {
      const [authorRes, missionRes, jobRes] = await Promise.all([
        queryBlogAuthor(), // 查询博客作者信息数据
        queryBlogMission(), // 查询博客使命信息数据
        queryJobExperienceList(), // 查询工作经历信息列表
      ])

      set({
        ...processBlogAuthorData(authorRes.data),
        blogMission: processBlogMissionData(missionRes.data),
        jobExperienceList: processJobExperienceData(jobRes.data),
        hasQuery: true,
      })
    } catch (error) {
      console.error('查询个人信息失败:', error)
    } finally {
      set({ loading: false })
    }
  },
})

// 创建关于页面数据store（生产环境不加devtools）
const useAboutStore =
  process.env.NODE_ENV === 'development'
    ? create<State & Actions>()(
        devtools(storeCreator, {
          name: 'AboutStore', // 开发环境显示名称
          enabled: true, // 显式启用（可选）
        }),
      )
    : create<State & Actions>()(storeCreator)

export default useAboutStore
