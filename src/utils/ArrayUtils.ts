import type { Article } from '@/types'

/**
 * 文章列表数组数据去重
 * @param preArticles
 * @param newArticles
 * @returns
 */
export const deduplicateArticles = (
  preArticles: Article[],
  newArticles: Article[],
) => {
  // 使用Map存储已存在的articleId，提高查找效率
  const articleIdMap = new Map()

  // 先将preArticles中的articleId存入Map
  preArticles.forEach(article => {
    articleIdMap.set(article.articleId, true)
  })

  // 过滤newArticles中已存在的文章，并添加到结果中
  const uniqueArticles = [...preArticles]
  newArticles.forEach(article => {
    if (!articleIdMap.has(article.articleId)) {
      uniqueArticles.push(article)
      articleIdMap.set(article.articleId, true)
    }
  })

  return uniqueArticles
}
