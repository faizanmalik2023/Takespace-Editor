import { Search } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">TakeSpace</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for something..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
            Learning
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
            Analytics
          </button>
        </div>
      </div>
    </header>
  )
}
