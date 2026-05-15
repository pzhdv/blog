import SkeletonBase from './SkeletonBase'

// 分类页左侧分类导航骨架屏
export const CategoryNavSkeleton = () => {
  return (
    <div className="md:w-64 mb-6 md:mb-0">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm md:sticky md:top-6">
        <SkeletonBase className="h-6 w-20 mb-4" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-9 w-full rounded-lg" />
            <SkeletonBase className="h-9 w-9 rounded-lg" />
          </div>
          <div className="ml-4 space-y-2">
            <SkeletonBase className="h-8 w-full rounded-lg" />
            <SkeletonBase className="h-8 w-full rounded-lg" />
          </div>
          <SkeletonBase className="h-9 w-full rounded-lg" />
          <SkeletonBase className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// 分类页单个文章卡片骨架屏
export const CategoryArticleCardSkeleton = () => {
  return (
    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <SkeletonBase className="w-full md:w-32 h-48 md:h-24 rounded-lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <SkeletonBase className="h-4 w-20" />
            <div className="flex gap-1">
              <SkeletonBase className="h-5 w-12 rounded-full" />
              <SkeletonBase className="h-5 w-14 rounded-full" />
              <SkeletonBase className="h-5 w-14 rounded-full" />
              <SkeletonBase className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <SkeletonBase className="h-6 w-3/4 mb-2" />
          <div className="space-y-1 mb-3">
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-5/6" />
          </div>
          <SkeletonBase className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// 分类页文章列表骨架屏
export const CategoryArticleListSkeleton = () => {
  return (
    <div className="space-y-0">
      {[1, 2, 3].map(i => (
        <CategoryArticleCardSkeleton key={i} />
      ))}
    </div>
  )
}

// 分类页面包屑骨架屏
export const BreadcrumbSkeleton = () => {
  return (
    <div className="mb-6 flex items-center">
      <SkeletonBase className="h-5 w-40" />
    </div>
  )
}

// 分类页分页骨架屏
export const PaginationSkeleton = () => {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonBase key={i} className="h-9 w-9 rounded-lg" />
      ))}
    </div>
  )
}
