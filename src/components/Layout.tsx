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
    <div className="min-h-screen flex flex-col" style={{backgroundColor:'#F8F7F2', color:'#2D3B2F'}}>
      <nav className="nav-bar sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-xl">🥦</span> 健康饮食管家
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="info-bar">
        <div className="max-w-5xl mx-auto px-6 h-9 flex items-center gap-6 text-sm text-white/90 overflow-x-auto">
          <span className="whitespace-nowrap">📅 {dateStr}</span>
          <span className="whitespace-nowrap">⏰ {timeStr}</span>
          <span className="whitespace-nowrap">🌡️ 今日目标：<strong style={{color:'#A8D878'}}>1800 kcal</strong></span>
          <span className="whitespace-nowrap">💧 每日 8 杯水</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      <footer className="nav-bar text-white/75 text-center py-6 text-sm">
        <strong className="text-white">🥦 健康饮食管家</strong> · 基于家中食材 · 智能推荐 · 健康生活
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-20 sm:hidden" style={{borderColor:'#E0DDD4'}}>
        <div className="flex">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${
                  isActive ? 'text-green-dark font-semibold' : 'text-gray-400'
                }`}>
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 sm:bottom-6 left-6 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg animate-fade-in-up transition-transform hover:scale-110"
          style={{background:'#3E5A30'}}>
          ↑
        </button>
      )}
    </div>
  )
}
