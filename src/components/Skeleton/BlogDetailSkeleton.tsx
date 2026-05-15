import SkeletonBase from './SkeletonBase'

// 文章详情页骨架屏 - 文章标题区域
export const TitleSkeleton = () => {
  return (
    // w-6xl 与layout/index.tsx main保持一致 用于撑开盒子
    <div className="space-y-6 pt-8 pb-2 px-4 md:w-6xl">
      <SkeletonBase className="h-10 w-3/4" />
      <div className="flex items-center gap-6  mt-8">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-6 w-6" />
          <SkeletonBase className="h-5 w-24" />
        </div>
      </div>
    </div>
  )
}

// 文章详情页骨架屏 - 标签区域
export const TagsSkeleton = () => {
  return (
    <div className="flex gap-2 mt-8 mb-8 pb-2 px-4 md:max-w-4xl">
      <SkeletonBase className="h-7 w-16 rounded-full" />
      <SkeletonBase className="h-7 w-20 rounded-full" />
    </div>
  )
}

// 文章详情页骨架屏 - 正文内容区域
export const ContentSkeleton = () => {
  return (
    <div className="space-y-4 pb-2 px-4 md:max-w-4xl">
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-5/6" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-4/5" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-3/4" />
    </div>
  )
}

// 文章详情页骨架屏 - 导航栏
export const NavBarSkeleton = () => {
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center">
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-4 w-4" />
            <SkeletonBase className="h-5 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
