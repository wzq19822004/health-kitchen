import { NavLink, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/', label: '今日', icon: '📊' },
  { to: '/ingredients', label: '食材', icon: '🥬' },
  { to: '/recipes', label: '食谱', icon: '📖' },
  { to: '/meal-log', label: '记录', icon: '📝' },
  { to: '/shopping-list', label: '购物', icon: '🛒' },
]

export default function Layout() {
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const now = new Date()
    setDateStr(`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`)
    const tick = () => {
      const d = new Date()
      setTimeStr(d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const iv = setInterval(tick, 10000)
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => { clearInterval(iv); window.removeEventListener('scroll', handleScroll) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Header */}
      <header className="bg-mint-700 text-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <h1 className="text-base font-bold flex items-center gap-1.5">
            <span>🥦</span> 健康饮食管家
          </h1>
          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        {/* Info bar */}
        <div className="bg-mint-800/60 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-1.5 flex items-center gap-4 text-xs text-white/80 overflow-x-auto">
            <span className="whitespace-nowrap">📅 {dateStr}</span>
            <span className="whitespace-nowrap">⏰ {timeStr}</span>
            <span className="whitespace-nowrap">🌡️ 今日目标 <strong className="text-mint-200">1800 kcal</strong></span>
            <span className="whitespace-nowrap">💧 每日 8 杯水</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 py-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-warm-200 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="flex">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${
                  isActive ? 'text-mint-600 font-semibold' : 'text-gray-400'
                }`
              }>
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 sm:bottom-6 left-4 z-20 w-10 h-10 rounded-full bg-mint-600 text-white shadow-lg flex items-center justify-center text-lg animate-fade-in-up hover:bg-mint-700 transition-colors">
          ↑
        </button>
      )}
    </div>
  )
}
