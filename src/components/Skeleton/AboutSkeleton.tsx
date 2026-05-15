import SkeletonBase from './SkeletonBase'

// 关于页个人信息卡片骨架屏
export const PersonalInfoSkeleton = () => {
  return (
    <div className="flex flex-col gap-1 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex justify-center">
        <SkeletonBase className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800" />
      </div>
      <div className="flex justify-center my-1">
        <SkeletonBase className="h-8 w-32" />
      </div>
      <div className="flex justify-between items-center">
        <SkeletonBase className="h-4 w-12" />
        <SkeletonBase className="h-4 w-12" />
        <SkeletonBase className="h-4 w-16" />
      </div>
      <div className="flex items-center">
        <SkeletonBase className="h-6 w-6 mr-2" />
        <SkeletonBase className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
        <SkeletonBase className="h-4 w-4/5" />
      </div>
    </div>
  )
}

// 关于页联系方式卡片骨架屏
export const ContactCardSkeleton = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
      <SkeletonBase className="h-6 w-20 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center p-3 rounded-lg">
            <SkeletonBase className="h-6 w-6 mr-3" />
            <div className="flex-1 space-y-1">
              <SkeletonBase className="h-4 w-12" />
              <SkeletonBase className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 关于页博客宗旨骨架屏
export const MissionSkeleton = () => {
  return (
    <div className="mt-8 md:mt-0 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
      <SkeletonBase className="h-8 w-32 mb-4" />
      <SkeletonBase className="h-4 w-full mb-2" />
      <SkeletonBase className="h-4 w-4/5 mb-6" />
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
        <SkeletonBase className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// 关于页经历成就骨架屏
export const ExperienceSkeleton = () => {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
      <SkeletonBase className="h-8 w-32 mb-6" />
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div
            key={i}
            className="border-l-4 border-gray-200 dark:border-gray-600 pl-4"
          >
            <div className="flex items-center">
              <SkeletonBase className="h-6 w-6" />
              <SkeletonBase className="h-6 w-40 ml-2" />
            </div>
            <SkeletonBase className="h-4 w-32 ml-8 mt-1" />
            <div className="ml-8 space-y-2 mt-2">
              <SkeletonBase className="h-3 w-full" />
              <SkeletonBase className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
