import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 定义状态类型
type State = {
  salmon: number
  tuna: number
}

// 定义操作类型
type Actions = {
  addSalmon: (qty: number) => void
  addTuna: (qty: number) => void
  reset: () => void
}

// 初始状态
const initialState: State = {
  salmon: 0,
  tuna: 0,
}

// 创建待办事项 Store（带持久化和异步操作）
const useHomeStore = create<State & Actions>()(
  persist(
    // 使用持久化中间件
    (set, get) => ({
      ...initialState,
      addSalmon: (qty: number) => {
        set({ salmon: get().salmon + qty })
      },
      addTuna: (qty: number) => {
        set({ tuna: get().tuna + qty })
      },
      reset: () => {
        set(initialState) // 关键重置代码
      },
    }),
    {
      name: 'todo-storage', // localStorage 的 key
      storage: createJSONStorage(() => sessionStorage), // 存储方式
    },
  ),
)

export default useHomeStore
