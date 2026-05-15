const SkeletonBase = ({
  className = '',
  width,
  height,
}: {
  className?: string
  width?: string | number
  height?: string | number
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

export default SkeletonBase
