import SkeletonBase from './SkeletonBase'

// 首页文章卡片骨架屏
export const HomeArticleCardSkeleton = () => {
  return (
    <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md">
      <SkeletonBase className="w-full h-48 rounded-t-lg" />
      <div className="p-6 space-y-4">
        <SkeletonBase className="h-7 w-3/4" />
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-5/6" />
        </div>
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// 首页文章列表骨架屏
export const HomeArticleListSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <HomeArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}

// 首页侧边栏作者信息骨架屏
export const AuthorInfoSkeleton = () => {
  return (
    <div className="p-6 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-start mb-6">
        <SkeletonBase className="w-16 h-16 rounded-full" />
        <div className="ml-4 flex-1 space-y-2">
          <SkeletonBase className="h-6 w-24" />
          <SkeletonBase className="h-4 w-16" />
        </div>
      </div>
      <SkeletonBase className="h-4 w-full mb-2" />
      <SkeletonBase className="h-4 w-4/5 mb-6" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <SkeletonBase className="h-7 w-8 mx-auto mb-2" />
            <SkeletonBase className="h-3 w-8 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// 首页侧边栏日历骨架屏
export const CalendarSkeleton = () => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex justify-between mb-4">
        <SkeletonBase className="h-5 w-24" />
        <div className="flex gap-1">
          <SkeletonBase className="h-5 w-5 rounded" />
          <SkeletonBase className="h-5 w-5 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          {['日', '一', '二', '三', '四', '五', '六'].map((_, i) => (
            <SkeletonBase key={i} className="h-6 w-6 rounded" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map(week => (
          <div key={week} className="flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <SkeletonBase key={day} className="h-7 w-7 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// 首页侧边栏标签列表骨架屏
export const TagListSkeleton = () => {
  return (
    <div className="p-6 rounded-lg bg-white dark:bg-gray-800">
      <SkeletonBase className="h-6 w-20 mb-4" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonBase key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
    </div>
  )
}
