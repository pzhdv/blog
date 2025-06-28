import React from 'react'
import { useOutlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 bg-gray-50 dark:bg-gray-900 `}
    >
      <header>header</header>
      <main className="max-w-6xl mx-auto">{useOutlet()}</main>
      <footer>footer</footer>
    </div>
  )
}
