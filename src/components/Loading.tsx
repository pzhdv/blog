const Loading = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400" />
        <p className="mt-4 text-gray-700 dark:text-gray-200 text-sm">
          加载中...
        </p>
      </div>
    </div>
  )
}

export default Loading
