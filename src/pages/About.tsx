import {
  queryJobExperienceList,
  queryBlogAuthor,
  queryBlogMission,
} from '@/api'
import IconFont from '@/components/IconFont'
import useDeviceType from '@/hooks/useDeviceType'
import type {
  Achievement,
  BlogAuthor,
  BlogMission,
  JobExperience,
  MissionPoint,
} from '@/types'
import { differenceInYears } from 'date-fns'
import { useEffect, useState } from 'react'

interface ContactMethodType {
  name: string
  value: string
  iconClass: string
  url?: string
}

export default function AboutPage() {
  const isMobile = useDeviceType()
  const [blogAuthor, setBlogAuthor] = useState<BlogAuthor | null>(null) // 作者个人信息
  const [contactMethodList, setContactMethodList] = useState<
    ContactMethodType[]
  >([]) // 联系方式列表
  const [blogMission, setBlogMission] = useState<BlogMission>() // 博客使命
  const [jobExperienceList, setJobExperienceList] = useState<JobExperience[]>(
    [],
  ) // 工作经历

  // 计算年龄
  const calculateAge = (birthDate: string | undefined) => {
    if (birthDate) {
      return differenceInYears(new Date(), new Date(birthDate))
    }
  }

  useEffect(() => {
    // !todo 查询博客作者信息数据
    const getBlogAuthor = async () => {
      try {
        const res = await queryBlogAuthor()
        setBlogAuthor(res.data)
        const contactMethods = [
          {
            name: 'Email',
            value: res.data.email,
            iconClass: 'iconfont icon-email',
          },
          {
            name: 'Website',
            value: res.data.website,
            iconClass: 'iconfont icon-website',
            url: res.data.website,
          },
          {
            name: 'GitHub',
            value: res.data.github,
            iconClass: 'iconfont icon-github',
            url: res.data.github,
          },
          {
            name: 'Phone',
            value: res.data.phone,
            iconClass: 'iconfont icon-phone',
          },
        ]
        setContactMethodList(contactMethods)
      } catch (error) {
        console.error('queryBlogAuthor', queryBlogAuthor)
      }
    }
    // !todo 查询博客使命信息数据
    const getBlogMission = async () => {
      try {
        const res = await queryBlogMission()
        if (!res.data) return
        const { missionPointListStr } = res.data

        // 数据加工：将字符串拆分为数组
        const missionPointList: MissionPoint[] = missionPointListStr
          ? missionPointListStr
              .split('&')
              .filter(Boolean)
              .map(missionPoint => ({ missionPoint }))
          : []

        // 更新状态
        setBlogMission({ ...res.data, missionPointList })
      } catch (error) {
        console.log('error', error)
      }
    }

    // todo 查询工作经历列表
    const getJobExperienceList = async () => {
      try {
        const res = await queryJobExperienceList()

        if (!Array.isArray(res.data)) return

        const list = res.data.map(experience => {
          const achievementList: Achievement[] =
            experience.achievementListStr
              ?.split('&')
              .map(achievement => ({ achievement })) ?? []
          return { ...experience, achievementList }
        })

        setJobExperienceList(list)
      } catch (error) {
        console.log(error)
      }
    }
    getBlogAuthor()
    getBlogMission()
    getJobExperienceList()
  }, [])

  const renderContactCard = () => {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">联络方式</h3>
        <div className="space-y-3">
          {contactMethodList.map(method => (
            <span
              key={method.name}
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">
                <IconFont
                  iconClass={method.iconClass}
                  color="oklch(62.3% 0.214 259.815)"
                  size={24}
                />
              </span>
              <div>
                <p className="text-sm font-medium dark:text-gray-200">
                  {method.name}
                </p>
                {method.url ? (
                  <a
                    href={method.value}
                    target="_blank"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {method.value}
                  </a>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {method.value}
                  </span>
                )}
              </div>
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    // grid-cols-3 三等份划分
    <div className="grid md:grid-cols-3 gap-8">
      {/* 左侧主内容 */} {/*col-span-1 占父盒子1等分 */}
      <div className="md:col-span-1 space-y-6">
        {/* 个人信息卡片 */}
        <div className="flex flex-col gap-1 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <div className="flex justify-center">
            <img
              src={blogAuthor?.avatar}
              alt="个人头像"
              className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg transform transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="flex justify-center my-1">
            <h5 className="text-2xl font-bold  dark:text-white">
              {blogAuthor?.fullName}
            </h5>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-gray-600 dark:text-gray-300  flex items-center">
              <span className="mr-1">
                <IconFont
                  iconClass="iconfont icon-nianling"
                  color="oklch(62.3% 0.214 259.815)"
                  size={16}
                />
              </span>
              <span className="text-sm">
                {calculateAge(blogAuthor?.birthday)}
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-300  flex items-center">
              <span className="mr-1">
                <IconFont
                  iconClass="iconfont icon-xueli"
                  color="oklch(62.3% 0.214 259.815)"
                  size={16}
                />
              </span>
              <span className="text-sm">{blogAuthor?.educationLevel}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300  flex items-center">
              <span className="mr-1">
                <IconFont
                  iconClass="iconfont icon-xuexiao"
                  color="oklch(62.3% 0.214 259.815)"
                  size={16}
                />
              </span>
              <span className="text-sm">{blogAuthor?.schoolName}</span>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-300  flex items-center">
            <span className="mr-2">
              <IconFont
                iconClass="iconfont icon-user"
                color="oklch(62.3% 0.214 259.815)"
                size={24}
              />
            </span>
            {blogAuthor?.position}
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {blogAuthor?.selfIntroduction}
          </div>
        </div>

        {/* 联系方式卡片 */}
        {!isMobile && renderContactCard()}
      </div>
      {/* 右侧主内容 */} {/*col-span-1 占父盒子2等分 */}
      <div className="grid md:col-span-2 space-y-8">
        {/* 博客宗旨*/}
        <section className="row-start-3 md:row-auto mt-8 md:mt-0 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            {blogMission && blogMission.missionTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {blogMission && blogMission.missionDescription}
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600 dark:text-gray-300">
            {blogMission &&
              blogMission.missionPointList?.map((item, index) => (
                <li key={index}>{item.missionPoint}</li>
              ))}
          </ul>
        </section>

        {/* 经历成就卡片 */}
        <section className="row-start-1 md:row-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-colors">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            🚀 经历与成就
          </h2>
          <div className="space-y-6">
            {jobExperienceList.map(item => (
              <div key={item.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center">
                  <IconFont
                    iconClass={item.titleIcon}
                    color="oklch(62.3% 0.214 259.815)"
                    size={24}
                  />
                  <h3 className="ml-2 text-lg font-semibold dark:text-gray-200">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm pl-8  text-gray-600 dark:text-gray-400">
                  {item.organization} · {item.timeRange}
                </p>

                <ul className="list-disc pl-8 space-y-2">
                  {item.achievementList?.map((achievement, index) => (
                    <li
                      key={index}
                      className="text-gray-600 dark:text-gray-300 text-sm"
                    >
                      {achievement.achievement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section className="row-start-2 md:row-auto">
          {/* 联系方式卡片 */}
          {isMobile && renderContactCard()}
        </section>
      </div>
    </div>
  )
}
