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
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

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

  // Tip rotation
  useEffect(() => {
    const iv = setInterval(() => setSelectedTip(i => (i + 1) % Math.min(HEALTH_TIPS.length, 4)), 8000)
    return () => clearInterval(iv)
  }, [])

  function toast(msg: string) {
    setToastMsg(msg); setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  function toggleUtensil(id: string) {
    setOwnedUtensils(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleGenerate() {
    const newMenu = generateDailyMenu(allRecipes, data.ingredients, data.mealLogs)
    setMenu(newMenu)
    setCurrentMenu(newMenu)
    toast('🍽️ 菜单已生成')
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
    toast(`✅ 已添加 ${count} 道菜到饮食记录`)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* ===== Hero Section ===== */}
      <div className="hero-gradient rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative">
          <h1 className="text-xl font-bold mb-1">🌿 今日健康</h1>
          <p className="text-white/70 text-xs mb-4">基于家中现有食材，智能生成每日菜单</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '🥬', value: data.ingredients.length, label: '食材' },
              { icon: '📖', value: allRecipes.length, label: '可做菜品' },
              { icon: '🔥', value: todayCal, label: '今日 kcal' },
              { icon: '📝', value: data.mealLogs.filter(l => l.cooked).length, label: '已做记录' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-mint-200 drop-shadow-sm">{s.value}</div>
                <div className="text-[10px] text-white/70 mt-0.5">{s.icon} {s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Expired Alert ===== */}
      {(expired.length > 0 || expiringSoon.length > 0) && (
        <div className="bg-red-soft rounded-xl p-4 border border-red-200 animate-fade-in-up">
          <h3 className="font-bold text-sm text-red-700 mb-1.5">⚠️ 食材提醒</h3>
          {expired.map(i => <div key={i.id} className="text-xs text-red-600">❌ {i.name} 已过期 {Math.abs(daysUntil(i.expiryDate!))} 天</div>)}
          {expiringSoon.map(i => <div key={i.id} className="text-xs text-orange-600">⚠️ {i.name} 还有 {daysUntil(i.expiryDate!)} 天过期</div>)}
        </div>
      )}

      {/* ===== Daily Menu ===== */}
      <div className="section-card">
        <div className="section-header">
          <h2><span>📋</span> 今日推荐菜单</h2>
          <div className="flex gap-2">
            <button onClick={handleGenerate} className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium hover:bg-white/30 transition">🎲 生成</button>
            {menu && <button onClick={handleAdopt} className="text-xs bg-mint-200 text-mint-800 px-3 py-1.5 rounded-full font-medium hover:bg-mint-100 transition">✅ 采用</button>}
          </div>
        </div>
        <div className="section-body">
          {menu ? (
            <div className="space-y-3">
              {(['breakfast','lunch','dinner','snack'] as const).map(key => {
                const recipes = menu[key]
                if (!recipes.length) return null
                const icons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }
                const labels: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
                return (
                  <div key={key}>
                    <h3 className="text-xs font-bold text-gray-500 mb-1.5">{icons[key]} {labels[key]}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => setDetail(r)} />)}
                    </div>
                  </div>
                )
              })}
              {(() => {
                const totalCal = Object.values(menu).flat().reduce((s, r) => s + r.nutrition.cal, 0)
                const pct = Math.min(100, Math.round(totalCal / 1800 * 100))
                const color = pct > 90 ? 'bg-orange-400' : pct > 70 ? 'bg-yellow-400' : 'bg-mint-400'
                return (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>🔥 热量进度</span><span>{totalCal} / 1800 kcal ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <div className="text-4xl mb-2">👨‍🍳</div>
              <p className="text-sm mb-3">点击生成，系统会根据现有食材推荐菜单</p>
              <button onClick={handleGenerate} className="text-sm bg-mint-500 text-white px-5 py-2 rounded-full font-medium hover:bg-mint-600 transition">🎲 生成今日菜单</button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Kitchen Utensils ===== */}
      <div className="section-card">
        <div className="section-header">
          <h2><span>🍳</span> 厨房器具</h2>
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">{ownedUtensils.length}/{UTENSILS.length}</span>
        </div>
        <div className="section-body">
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
            {UTENSILS.map(u => (
              <button key={u.id} onClick={() => toggleUtensil(u.id)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                  ownedUtensils.includes(u.id)
                    ? 'border-mint-500 bg-mint-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-mint-300'
                }`}>
                <span className={`text-xl ${ownedUtensils.includes(u.id) ? '' : 'opacity-40 grayscale'}`}>{u.icon}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${ownedUtensils.includes(u.id) ? 'text-mint-700' : 'text-gray-400'}`}>
                  {u.name}
                  {ownedUtensils.includes(u.id) && ' ✓'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Health Tips ===== */}
      <div className="section-card">
        <div className="section-header">
          <h2><span>🌿</span> 科学养生知识</h2>
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">{selectedTip + 1}/{Math.min(HEALTH_TIPS.length, 4)}</span>
        </div>
        <div className="section-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HEALTH_TIPS.slice(0, 4).map((t, i) => {
              const cls = {
                green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-800',
                blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800',
                teal: 'bg-gradient-to-br from-teal-50 to-teal-100 text-teal-800',
                orange: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800',
                purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800',
                red: 'bg-gradient-to-br from-red-50 to-red-100 text-red-800',
              }[t.color] || 'bg-gradient-to-br from-green-50 to-green-100 text-green-800'
              return (
                <div key={t.id} className={`rounded-xl p-3.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${cls} ${i === selectedTip ? 'ring-2 ring-mint-400 scale-[1.02]' : ''}`}>
                  <div className="text-2xl mb-1.5">{t.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{t.title}</h3>
                  <p className="text-xs leading-relaxed opacity-80">{t.body}</p>
                  <div className="text-[10px] opacity-50 mt-2 flex items-center gap-1">📖 {t.source}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/ingredients', icon: '🥬', label: '管理食材', color: 'bg-green-soft text-green-700' },
          { to: '/recipes', icon: '📖', label: '浏览食谱', color: 'bg-blue-soft text-blue-700' },
          { to: '/meal-log', icon: '📝', label: '饮食记录', color: 'bg-yellow-soft text-yellow-800' },
          { to: '/shopping-list', icon: '🛒', label: '购物清单', color: 'bg-orange-soft text-orange-800' },
        ].map(a => (
          <a key={a.to} href={a.to}
            className={`rounded-xl p-3.5 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${a.color}`}>
            <div className="text-2xl">{a.icon}</div>
            <div className="text-xs font-bold mt-1">{a.label}</div>
          </a>
        ))}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 z-30 bg-mint-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-slide-in">
          {toastMsg}
        </div>
      )}

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
