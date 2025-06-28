// 导入icon样式 index.css @import './assets/font/iconfont.css';
import type { FC } from 'react'

interface IProps {
  iconClass: string
  color?: string
  size?: number
}
// 字体组件
const IconFont: FC<IProps> = props => {
  return (
    <div style={{ color: props.color || '#1677ff' }}>
      <i style={{ fontSize: props.size || 28 }} className={props.iconClass} />
    </div>
  )
}

export default IconFont
