export default function Footer() {
  return (
    <footer className="py-8 mt-4 text-gray-600 dark:bg-gray-800 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
            GitHub
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
            Twitter
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">
            联系
          </a>
        </div>
        <p className="text-sm">© 2024 技术博客. 保留所有权利</p>
      </div>
    </footer>
  )
}
