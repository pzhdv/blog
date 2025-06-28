import axios from 'axios'
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios'
import qs from 'qs'
import objectHash from 'object-hash' // 轻量哈希库

// 基础响应类型
interface BaseResponse<T = any> {
  code: number // 业务状态码
  message: string // 业务消息
  data: T // 响应数据
}

// 自定义请求配置，扩展了AxiosRequestConfig
interface CustomRequestConfig extends AxiosRequestConfig {
  requestId?: string // 请求唯一标识 (用于防重)
  withToken?: boolean // 是否在请求头中携带 Token（默认值：false）
  showLoading?: boolean // 是否显示加载状态（默认值：false）
  preventDuplicate?: boolean // 是否防止重复请求（启用时会根据 requestId 取消重复请求，默认值：false）
  showError?: boolean // 是否显示错误提示（默认值：false）
  isUpload?: boolean // 是否为文件上传请求（默认值：false）
}

/**
 * 自定义请求类，封装了axios的常用功能
 * 提供请求/响应拦截、重复请求取消、加载状态管理等功能
 */
class Request {
  private instance: AxiosInstance // axios实例
  private pendingRequests: Map<string, { cancel: (message: string) => void }> =
    new Map() // 进行中的请求Map
  private pendingQueue: string[] = [] // 请求ID队列，用于维护请求顺序

  private maxPendingRequests = 50 // 最大pending请求数，超过会自动清理最早的请求
  private loadingDebounceTimer: ReturnType<typeof setTimeout> | null = null // 加载状态防抖计时器
  private loadingDebounceDelay = 300 // 延迟时间，单位为毫秒
  private loadingCount = 0 // 加载状态计数器

  /**
   * 构造函数
   * @param config 自定义请求配置
   */
  constructor(config: CustomRequestConfig = {}) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000, // 默认10秒超时
      headers: {
        'Content-Type': 'application/json;charset=UTF-8', // 默认JSON格式
      },
      paramsSerializer: params => qs.stringify(params, { indices: false }), // 参数序列化
      ...config, // 合并其他配置
    })

    // 设置拦截器
    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as CustomRequestConfig
        // Token 处理
        if (customConfig.withToken) {
          const token = this.getToken()
          if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        // 重复请求处理（文件上传除外）
        if (customConfig.preventDuplicate && !customConfig.isUpload) {
          const requestId =
            customConfig.requestId || this.generateRequestId(customConfig)
          customConfig.requestId = requestId
          this.cancelRequest(requestId, '取消重复请求')
          this.addPendingRequest(requestId, customConfig)
        }

        // 加载状态拦截器，在 重复请求处理后 否则会有UI闪烁问题
        if (customConfig.showLoading) {
          this.showLoading()
        }

        return config
      },
      (error: AxiosError) => {
        console.error('axios 请求拦截器出错:', error)
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<BaseResponse>) => {
        return this.handleSuccessResponse(response)
      },
      (error: AxiosError) => {
        return this.handleErrorResponse(error)
      },
    )
  }

  /**
   * 添加请求到pendingRequests Map中
   * @param requestId 请求ID
   * @param config 请求配置
   */
  private addPendingRequest(requestId: string, config: CustomRequestConfig) {
    /**
     * 在响应拦截器中（无论是成功还是失败），我们都会从 `pendingRequests` Map 中移除该请求（通过 `requestId`）,那么为什么还需要在 `addPendingRequest` 方法中清理旧的请求呢？
     * 原因在于：有些请求可能长时间没有响应（比如网络问题导致请求一直处于pending状态），而新的请求又不断产生。如果不做清理，`pendingRequests` Map 会无限增长，导致内存泄漏。
     */
    // 清理最早请求的示例 防止内存泄漏
    if (this.pendingRequests.size >= this.maxPendingRequests) {
      this.cleanupOldRequests()
    }

    // 创建取消令牌并添加到Map中
    const source = axios.CancelToken.source()
    config.cancelToken = source.token // 将 CancelToken 绑定到请求配置中

    // 添加到队列和Map
    this.pendingQueue.push(requestId)
    this.pendingRequests.set(requestId, {
      cancel: (message = `请求被取消: ${requestId}`) => source.cancel(message),
    })
  }

  /**
   * 清理最早的请求
   */
  private cleanupOldRequests() {
    while (this.pendingRequests.size >= this.maxPendingRequests) {
      // 获取当前 pending 请求中最早加入的那个请求的 requestId。
      const oldestId = this.pendingQueue.shift()!
      this.cancelRequest(oldestId, '系统自动清理请求')
    }
  }
  /**
   * 取消指定请求
   * @param requestId 请求ID
   * @param message 取消消息
   */
  public cancelRequest(requestId: string, message?: string) {
    const request = this.pendingRequests.get(requestId)
    if (request) {
      // 1. 执行取消函数(只有在提供message时才执行取消、在响应完成后不需要取消了)
      if (message !== undefined) {
        request.cancel(message)
      }

      // 2. 从Map中删除
      this.pendingRequests.delete(requestId)

      // 3. 从队列中删除
      const index = this.pendingQueue.indexOf(requestId)
      if (index > -1) {
        this.pendingQueue.splice(index, 1)
      }
    }
  }

  /**
   * 生成请求唯一ID
   * @param config 请求配置
   * @returns 生成的请求ID
   */
  private generateRequestId(config: CustomRequestConfig): string {
    const { method = 'GET', url, params, data } = config
    return objectHash.sha1({
      method,
      url,
      params,
      data: data instanceof FormData ? 'FormData' : data,
    })
  }

  /**
   * 处理成功响应
   * @param response 响应对象
   * @returns 处理后的响应数据
   */
  private handleSuccessResponse(response: AxiosResponse<BaseResponse>): any {
    const config = response.config as CustomRequestConfig

    // 关闭 loading
    if (config.showLoading) {
      this.hideLoading()
    }

    // 移除已完成的请求
    if (config?.requestId) {
      // 不传递message参数 => 只清理不取消
      this.cancelRequest(config.requestId)
    }

    // 业务状态码处理
    const { code, message } = response.data
    if (code !== 200) {
      if (code === 401) {
        this.handleTokenExpired()
      } else {
        console.error('服务器返回的自定义异常：', message)
        // 显示错误提示
        if (config?.showError) {
          this.showErrorMessage(message)
        }
        // 抛出错误
        throw {
          code: code,
          message: message,
          data: null,
        }
      }
    }

    // 直接返回完整的 BaseResponse 结构
    return response.data
  }

  /**
   * 处理错误响应
   * @param error 错误对象
   * @returns 拒绝的Promise
   */
  private handleErrorResponse(error: AxiosError): Promise<BaseResponse> {
    // cancelError config为undefined
    const config = error.config as CustomRequestConfig | undefined

    // 关闭 loading
    if (config?.showLoading) {
      this.hideLoading()
    }

    // 移除已完成的请求
    if (config?.requestId) {
      // 不传递message参数 => 只清理不取消
      this.cancelRequest(config.requestId)
    }

    // 处理重复请求取消错误
    if (axios.isCancel(error)) {
      console.warn('重复请求取消错误:', error.message)
      // return new Promise(() => {}) // 返回一个永远不会解决的 Promise
      return Promise.reject({
        code: -1,
        message: '请求被取消',
        data: null,
      })
    }

    // 处理 HTTP 错误
    let status = 0
    let errorMessage = '未知错误'
    const axiosError = error as AxiosError<{ message?: string }>
    if (axiosError.response) {
      status = axiosError.response.status || 0
      errorMessage = this.getErrorMessageByHttpCode(error, status)
    } else if (axiosError.request) {
      // 请求未收到响应（如超时）
      errorMessage = '请求超时，请检查网络连接'
    }

    // 显示错误提示
    if (config?.showError) {
      this.showErrorMessage(errorMessage)
    }
    console.error('axios 响应拦截器错误:', errorMessage)
    // 返回符合 BaseResponse 结构的错误
    return Promise.reject({
      code: status || -1,
      message: errorMessage,
      data: axiosError.response?.data || null,
    })
  }

  /**
   * 从本地存储获取Token
   * @returns Token字符串或null
   */
  private getToken(): string | null {
    return localStorage.getItem('token')
  }

  /**
   * 清除本地存储中的Token
   */
  private clearToken() {
    localStorage.removeItem('token')
  }

  /**
   * 显示加载状态
   */
  private showLoading() {
    this.loadingCount++

    // 清除之前的隐藏定时器
    if (this.loadingDebounceTimer) {
      clearTimeout(this.loadingDebounceTimer)
      this.loadingDebounceTimer = null
    }

    // 只有在从0变为1时才真正显示loading
    if (this.loadingCount === 1) {
      console.log('显示全局 loading')
    }
  }

  /**
   * 隐藏加载状态
   */
  private hideLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1)

    // 设置防抖定时器
    if (this.loadingCount === 0) {
      this.loadingDebounceTimer = setTimeout(() => {
        console.log('隐藏全局 loading')
        this.loadingDebounceTimer = null
      }, this.loadingDebounceDelay)
    }
  }

  /**
   * 处理Token过期
   */
  private handleTokenExpired() {
    this.clearToken()
    console.error('登录状态已过期，请重新登录')
    // 实际项目中这里应该跳转到登录页
  }

  /**
   * 根据HTTP状态码获取错误消息
   * @param error 错误对象
   * @param status HTTP状态码
   * @returns 错误消息
   */
  private getErrorMessageByHttpCode(error: AxiosError, status: number): string {
    const errorMap: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请登录',
      403: '拒绝访问',
      404: '请求资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      500: '服务器内部错误',
      501: '服务未实现',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
      505: 'HTTP版本不受支持',
    }
    // 错误消息优先级：状态码映射消息 > 后端返回消息 > 默认消息
    const errMessage = errorMap[status]
    const serverErrMessage = (error.response?.data as any)?.message
    const defaultErrMessage = `请求失败，状态码: ${status}`
    return errMessage || serverErrMessage || defaultErrMessage
  }

  /**
   * 显示错误消息（示例实现）
   * @param errMessage 错误消息
   */
  private showErrorMessage(errMessage: string) {
    console.error(`错误弹框信息提示: ${errMessage}`)
  }

  // ========== 公共方法 ==========
  /**
   * 通用请求方法
   * @param config 请求配置
   * @returns Promise包装的响应数据
   */
  public request<T = any>(
    config: CustomRequestConfig,
  ): Promise<BaseResponse<T>> {
    return this.instance.request(config)
  }

  /**
   * GET请求
   * @param url 请求URL
   * @param params 查询参数
   * @param config 自定义配置
   * @returns Promise包装的响应数据
   */
  public get<T = any>(
    url: string,
    params?: any,
    config?: CustomRequestConfig,
  ): Promise<BaseResponse<T>> {
    return this.request({
      ...config,
      method: 'GET',
      url,
      params,
    })
  }

  /**
   * POST请求
   * @param url 请求URL
   * @param data 请求体数据
   * @param config 自定义配置
   * @returns Promise包装的响应数据
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: CustomRequestConfig,
  ): Promise<BaseResponse<T>> {
    return this.request({
      ...config,
      method: 'POST',
      url,
      data,
    })
  }

  /**
   * PUT请求
   * @param url 请求URL
   * @param data 请求体数据
   * @param config 自定义配置
   * @returns Promise包装的响应数据
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: CustomRequestConfig,
  ): Promise<BaseResponse<T>> {
    return this.request({
      ...config,
      method: 'PUT',
      url,
      data,
    })
  }

  /**
   * 删除方法 - 支持单个ID删除和批量IDs删除
   * @param url 删除接口基础URL
   * @param options 删除选项
   * @param options.id 单个删除时的ID
   * @param options.ids 批量删除时的ID数组
   * @param options.config 自定义请求配置
   * @returns 删除结果Promise
   */
  public delete<T = any>(
    url: string,
    options: {
      id?: string | number
      ids?: Array<string | number>
      config?: CustomRequestConfig
    },
  ): Promise<BaseResponse<T>> {
    // 处理单个ID删除
    if (options.id !== undefined) {
      return this.request({
        ...options.config,
        method: 'DELETE',
        url: `${url}/${options.id}`,
      })
    }

    // 处理批量ID删除
    if (options.ids && options.ids.length > 0) {
      // 将ID数组转换为查询参数格式 (例如: ids=1&ids=2&ids=3)
      const idsStr = qs.stringify({ ids: options.ids }, { indices: false })
      return this.request({
        ...options.config,
        method: 'DELETE',
        url: `${url}?${idsStr}`,
      })
    }

    // 抛出错误：必须提供id或ids参数
    return Promise.reject({
      code: -1,
      message: '至少需要提供id或ids参数',
      data: null,
    })
  }

  /**
   * 文件上传方法
   * @param url 上传地址
   * @param file 文件对象(File或FormData)
   * @param data 其他附加数据
   * @param config 自定义配置
   * @returns Promise包装的响应数据
   */
  public upload<T = any>(
    url: string,
    file: File | FormData,
    data?: Record<string, any>,
    config?: CustomRequestConfig,
  ): Promise<BaseResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData()

    if (!(file instanceof FormData)) {
      formData.append('file', file)
    }

    // 添加其他数据
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
    }

    return this.request({
      ...config,
      method: 'POST',
      url,
      data: formData,
      isUpload: true, // 标记为上传请求
      preventDuplicate: false, // 上传请求不进行重复请求取消
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  /**
   * 取消所有进行中的请求
   * @param message 取消原因
   */
  public cancelAllRequests(message: string = '取消所有请求') {
    // 复制一份ID列表避免迭代时修改
    const requestIds = [...this.pendingQueue]

    requestIds.forEach(requestId => {
      this.cancelRequest(requestId, message)
    })
  }
}

// 创建请求实例
const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // preventDuplicate: true,
})

export default request
