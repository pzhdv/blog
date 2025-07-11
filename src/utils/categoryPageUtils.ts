import type { ArticleCategory } from '@/types'

// 将树形结构的分类数据转换为扁平化的列表数据
export const treeDataToListData = (
  treeData: ArticleCategory[],
): ArticleCategory[] => {
  const listData: ArticleCategory[] = []

  // 递归遍历树形结构
  const traverse = (categories: ArticleCategory[]): void => {
    categories.forEach(category => {
      // 创建一个新对象，去除 children 属性
      const { children, ...categoryWithoutChildren } = category
      listData.push(categoryWithoutChildren) // 将去除 children 的分类添加到列表中
      if (children && children.length > 0) {
        traverse(children) // 递归处理子分类
      }
    })
  }

  traverse(treeData) // 从顶层分类开始递归遍历
  return listData
}

// 收集该分类及所有子分类ids categoryId
export const collectCategoryIds = (category: ArticleCategory): number[] => {
  const ids: number[] = [category.categoryId] // 初始化数组，包含当前分类的 categoryId

  // 递归收集子分类的 categoryId
  const traverse = (categories: ArticleCategory[]): void => {
    categories.forEach(child => {
      ids.push(child.categoryId) // 将子分类的 categoryId 添加到数组中
      if (child.children && child.children.length > 0) {
        traverse(child.children) // 递归处理子分类
      }
    })
  }

  if (category.children && category.children.length > 0) {
    traverse(category.children) // 从当前分类的子分类开始递归
  }

  return ids // 返回包含当前分类及所有子分类的 categoryId 数组
}
