import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '今日', icon: '📊' },
  { to: '/ingredients', label: '食材', icon: '🥬' },
  { to: '/recipes', label: '食谱', icon: '📖' },
  { to: '/meal-log', label: '记录', icon: '📝' },
  { to: '/shopping-list', label: '购物', icon: '🛒' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      <header className="bg-mint-600 text-white px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>🥦</span> 健康饮食管家
          </h1>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 py-4 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  isActive ? 'text-mint-600 font-semibold' : 'text-gray-400'
                }`
              }
            >
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
