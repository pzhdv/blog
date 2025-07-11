export default function Footer() {
  return (
    <footer className="py-8  text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 ">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a
            href="https://github.com/pzhdv"
            target="_blank"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            GitHub
          </a>
          {/* <a
            href="https://gitee.com/panzonghui"
            target="_blank"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Gitee
          </a> */}
          <a
            href="https://juejin.cn/user/1363841737818167/posts"
            target="_blank"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            掘金
          </a>
          <a
            href="https://blog.csdn.net/pzhdv"
            target="_blank"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            CSDN
          </a>
        </div>
        <p className="text-sm">© 2025 技术博客. 保留所有权利</p>
        <p>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            className="text-sm"
          >
            黔ICP备2025050132号
          </a>
        </p>
      </div>
    </footer>
  )
}
