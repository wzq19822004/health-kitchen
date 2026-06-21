import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getAllRecipes, generateDailyMenu } from '../lib/recipe-recommend'
import RecipeCard from '../components/RecipeCard'
import RecipeDetailModal from '../components/RecipeDetailModal'
import { daysUntil, createMealLog } from '../data/storage'
import { UTENSILS } from '../data/utensils'
import { HEALTH_TIPS } from '../data/health-tips'
import type { Recipe, DailyMenu } from '../types'

const UTENSIL_KEY = 'hk_utensils'
function loadUtensils(): string[] {
  try { return JSON.parse(localStorage.getItem(UTENSIL_KEY) || '[]') }
  catch { return [] }
}
function saveUtensils(ids: string[]) {
  localStorage.setItem(UTENSIL_KEY, JSON.stringify(ids))
}

export default function Dashboard() {
  const { data, setCurrentMenu, addMealLog } = useApp()
  const [detail, setDetail] = useState<Recipe | null>(null)
  const [menu, setMenu] = useState<DailyMenu | null>(data.currentMenu)
  const [ownedUtensils, setOwnedUtensils] = useState<string[]>(loadUtensils)
  const [selectedTip, setSelectedTip] = useState(0)
  const [toast, setToast] = useState({ show: false, msg: '' })

  const allRecipes = useMemo(() => getAllRecipes(data.customRecipes), [data.customRecipes])
  const todayStr = new Date().toISOString().split('T')[0]
  const todayLogs = data.mealLogs.filter(l => l.date === todayStr)
  const todayCal = todayLogs.filter(l => l.cooked).reduce((sum, l) => {
    const r = allRecipes.find(rec => rec.id === l.recipeId)
    return sum + (r?.nutrition.cal || 0)
  }, 0)
  const expiringSoon = data.ingredients.filter(i => i.expiryDate && daysUntil(i.expiryDate) <= 3 && daysUntil(i.expiryDate) >= 0)
  const expired = data.ingredients.filter(i => i.expiryDate && daysUntil(i.expiryDate) < 0)

  useEffect(() => { saveUtensils(ownedUtensils) }, [ownedUtensils])
  useEffect(() => {
    const iv = setInterval(() => setSelectedTip(i => (i + 1) % Math.min(HEALTH_TIPS.length, 4)), 8000)
    return () => clearInterval(iv)
  }, [])

  function showToast(msg: string) {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), 2500)
  }

  function toggleUtensil(id: string) {
    setOwnedUtensils(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleGenerate() {
    const newMenu = generateDailyMenu(allRecipes, data.ingredients, data.mealLogs)
    setMenu(newMenu)
    setCurrentMenu(newMenu)
    showToast('🍽️ 菜单已生成')
  }

  function handleAdopt() {
    if (!menu) return
    const existingIds = new Set(data.mealLogs.filter(l => l.date === todayStr).map(l => l.recipeId))
    let count = 0
    for (const recipes of Object.values(menu)) {
      for (const r of recipes) {
        if (!existingIds.has(r.id)) {
          addMealLog(createMealLog(r.id, r.name, r.mealType, todayStr))
          existingIds.add(r.id)
          count++
        }
      }
    }
    showToast(`✅ 已添加 ${count} 道菜到饮食记录`)
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* ===== FULL-WIDTH HERO ===== */}
      <div className="full-width hero-wrap">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center relative">
          <h1 className="text-white text-2xl font-extrabold mb-2 tracking-wide">🌿 居家健康厨房</h1>
          <p className="text-white/80 text-sm leading-relaxed mb-5 max-w-xl mx-auto">
            基于家中现有食材与器具，智能生成每日健康菜单<br />
            科学养生 · 热量追踪 · 库存管理 · 营养均衡
          </p>
          <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
            {[
              { value: data.ingredients.length, label: '当前食材' },
              { value: allRecipes.length, label: '可做菜品' },
              { value: todayCal, label: '今日摄入 kcal' },
              { value: data.mealLogs.filter(l => l.cooked).length, label: '已做记录' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold" style={{color:'#93C572'}}>{s.value}</div>
                <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expired alert */}
      {(expired.length > 0 || expiringSoon.length > 0) && (
        <div className="rounded-xl p-4" style={{background:'#FDEDEC', border:'1px solid #f5c6cb'}}>
          <h3 className="font-bold text-sm mb-1.5" style={{color:'#C0392B'}}>⚠️ 食材提醒</h3>
          {expired.map(i => <div key={i.id} className="text-xs" style={{color:'#C0392B'}}>❌ {i.name} 已过期 {Math.abs(daysUntil(i.expiryDate!))} 天</div>)}
          {expiringSoon.map(i => <div key={i.id} className="text-xs" style={{color:'#E67E22'}}>⚠️ {i.name} 还有 {daysUntil(i.expiryDate!)} 天过期</div>)}
        </div>
      )}

      {/* Daily Menu */}
      <div className="section-card">
        <div className="section-header">
          <h2><span>📋</span> 今日健康菜单</h2>
          <div className="flex gap-2">
            <button onClick={handleGenerate} className="text-sm px-4 py-1.5 rounded-full font-medium transition" style={{background:'rgba(255,255,255,0.15)', color:'#fff'}}>🎲 重新生成</button>
            {menu && <button onClick={handleAdopt} className="text-sm px-4 py-1.5 rounded-full font-medium transition" style={{background:'#93C572', color:'#3E5A30'}}>✅ 采用此菜单</button>}
          </div>
        </div>
        <div className="section-body">
          {menu ? (
            <div className="space-y-4">
              {(['breakfast','lunch','dinner','snack'] as const).map(key => {
                const recipes = menu[key]
                if (!recipes.length) return null
                const icons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }
                const labels: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
                return (
                  <div key={key}>
                    <h3 className="text-sm font-bold mb-2" style={{color:'#5A6B5C'}}>{icons[key]} {labels[key]}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => setDetail(r)} />)}
                    </div>
                  </div>
                )
              })}
              {(() => {
                const totalCal = Object.values(menu).flat().reduce((s, r) => s + r.nutrition.cal, 0)
                const pct = Math.min(100, Math.round(totalCal / 1800 * 100))
                return (
                  <div className="mt-3 p-4 rounded-xl" style={{background:'#E8F5D8'}}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex gap-5">
                        <div className="text-center"><div className="text-lg font-extrabold" style={{color:'#3E5A30'}}>{totalCal}</div><div className="text-xs" style={{color:'#5A6B5C'}}>总热量 kcal</div></div>
                        <div className="text-center"><div className="text-lg font-extrabold" style={{color:'#3E5A30'}}>{Object.values(menu).flat().reduce((s,r)=>s+r.nutrition.protein,0)}g</div><div className="text-xs" style={{color:'#5A6B5C'}}>蛋白质</div></div>
                        <div className="text-center"><div className="text-lg font-extrabold" style={{color:'#3E5A30'}}>{Object.values(menu).flat().reduce((s,r)=>s+r.nutrition.carb,0)}g</div><div className="text-xs" style={{color:'#5A6B5C'}}>碳水</div></div>
                        <div className="text-center"><div className="text-lg font-extrabold" style={{color:'#3E5A30'}}>{Object.values(menu).flat().reduce((s,r)=>s+r.nutrition.fat,0)}g</div><div className="text-xs" style={{color:'#5A6B5C'}}>脂肪</div></div>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <div className="flex justify-between text-xs" style={{color:'#5A6B5C'}}><span>热量进度</span><span>{pct}%</span></div>
                        <div className="h-3 rounded-full mt-1 overflow-hidden" style={{background:'#e0e0e0'}}>
                          <div className="h-full rounded-full transition-all duration-500" style={{width: `${pct}%`, background: 'linear-gradient(90deg,#93C572,#3E5A30)'}} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="text-center py-10" style={{color:'#8A9B8C'}}>
              <div className="text-5xl mb-3">👨‍🍳</div>
              <p className="text-sm">点击右上角「重新生成」，AI 将为您推荐适合今天的健康菜单！</p>
            </div>
          )}
        </div>
      </div>

      {/* Utensil Selector */}
      <div className="section-card">
        <div className="section-header">
          <h2><span>🍳</span> 厨房器具</h2>
          <span className="tag tag-green">已选 {ownedUtensils.length} 件</span>
        </div>
        <div className="section-body">
          <div className="utensil-grid grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
            {UTENSILS.map(u => (
              <button key={u.id} onClick={() => toggleUtensil(u.id)}
                className={`rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                  ownedUtensils.includes(u.id)
                    ? 'border-green-dark bg-green-pale shadow-sm'
                    : 'hover:border-green-light hover:bg-green-pale'
                }`}
                style={{borderColor: ownedUtensils.includes(u.id) ? '#3E5A30' : '#E0DDD4'}}>
                <div className="text-2xl mb-1">{u.icon}</div>
                <div className="text-xs font-semibold" style={{color: ownedUtensils.includes(u.id) ? '#3E5A30' : '#2D3B2F'}}>
                  {u.name}{ownedUtensils.includes(u.id) ? ' ✓' : ''}
                </div>
                <div className="text-[10px] mt-0.5" style={{color:'#8A9B8C'}}>{u.note}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="section-card">
        <div className="section-header">
          <h2><span>🌿</span> 科学养生健康知识</h2>
          <span className="tag tag-green">📚 基于最新科研</span>
        </div>
        <div className="section-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HEALTH_TIPS.slice(0, 4).map((t, i) => {
              const bg = { green: 'linear-gradient(135deg,#E8F5D8,#D0EBB0)', blue: 'linear-gradient(135deg,#EBF5FB,#CCE4F7)', orange: 'linear-gradient(135deg,#FEF9E7,#FDEBD0)', purple: 'linear-gradient(135deg,#F5EEF8,#E8DAEF)', red: 'linear-gradient(135deg,#FDEDEC,#FADBD8)', teal: 'linear-gradient(135deg,#E8F8F5,#C8EBE4)' }[t.color] || 'linear-gradient(135deg,#E8F5D8,#D0EBB0)'
              return (
                <div key={t.id} className={`rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${i === selectedTip ? 'ring-2 ring-green-dark scale-[1.02]' : ''}`}
                  style={{background: bg}}>
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <h3 className="text-sm font-bold mb-1.5">{t.title}</h3>
                  <p className="text-xs leading-relaxed opacity-80">{t.body}</p>
                  <div className="text-[10px] opacity-50 mt-2 flex items-center gap-1">📖 {t.source}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/ingredients', icon: '🥬', label: '食材库', color: '#E8F5D8', text: '#3E5A30' },
          { to: '/recipes', icon: '📖', label: '食谱库', color: '#EBF5FB', text: '#1A5276' },
          { to: '/meal-log', icon: '📝', label: '饮食记录', color: '#FEF9E7', text: '#A04000' },
          { to: '/shopping-list', icon: '🛒', label: '购物清单', color: '#F5EEF8', text: '#512E5F' },
        ].map(a => (
          <a key={a.to} href={a.to}
            className="rounded-xl p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{background: a.color}}>
            <div className="text-2xl">{a.icon}</div>
            <div className="text-xs font-bold mt-1.5" style={{color: a.text}}>{a.label}</div>
          </a>
        ))}
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-28 sm:bottom-24 right-6 z-30 animate-slide-in px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white"
          style={{background:'#3E5A30'}}>
          {toast.msg}
        </div>
      )}

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
