import useDeviceType from '@/hooks/useDeviceType'

const Skeleton = () => {
  const isMobile = useDeviceType()

  if (!isMobile) return
  return (
    <div
      style={{
        height: '70vh',
      }}
    >
      {/* 解决查询状态、显示footer模块 */}
    </div>
  )
}

export default Skeleton
