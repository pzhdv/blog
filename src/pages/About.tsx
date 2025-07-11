import { useEffect } from 'react'
import { differenceInYears } from 'date-fns'

import { useAboutStore } from '@/store'

import IconFont from '@/components/IconFont'
import useDeviceType from '@/hooks/useDeviceType'

export default function AboutPage() {
  const isMobile = useDeviceType()
  const {
    blogAuthor, // 作者信息
    contactMethodList, // 联系方式列表
    blogMission, // 博客使命
    jobExperienceList, // 工作经历
    hasQuery, // 是否已经查询过数据，用于控制是否需要重新加载数据
    fetchAllData, // 获取所有数据的方法，用于并行加载作者信息、博客使命和工作经历
  } = useAboutStore()

  // 计算年龄
  const calculateAge = (birthDate: string | undefined) => {
    if (birthDate) {
      return differenceInYears(new Date(), new Date(birthDate))
    }
  }

  useEffect(() => {
    if (!hasQuery) {
      fetchAllData()
    }
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQuery])

  // 渲染联系卡片
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
                    rel="noopener noreferrer"
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
    <div className="grid md:grid-cols-3 gap-8 min-h-[90vh] md:min-h-0">
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
