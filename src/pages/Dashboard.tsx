import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getAllRecipes, generateDailyMenu } from '../lib/recipe-recommend'
import RecipeCard from '../components/RecipeCard'
import RecipeDetailModal from '../components/RecipeDetailModal'
import { daysUntil, createMealLog } from '../data/storage'
import type { Recipe, DailyMenu } from '../types'

export default function Dashboard() {
  const { data, setCurrentMenu, addMealLog } = useApp()
  const [detail, setDetail] = useState<Recipe | null>(null)
  const [menu, setMenu] = useState<DailyMenu | null>(data.currentMenu)

  const allRecipes = useMemo(() => getAllRecipes(data.customRecipes), [data.customRecipes])
  const todayStr = new Date().toISOString().split('T')[0]
  const todayLogs = data.mealLogs.filter(l => l.date === todayStr)
  const todayCal = todayLogs.filter(l => l.cooked).reduce((sum, l) => {
    const r = allRecipes.find(rec => rec.id === l.recipeId)
    return sum + (r?.nutrition.cal || 0)
  }, 0)

  const expiringSoon = data.ingredients
    .filter(i => i.expiryDate && daysUntil(i.expiryDate) <= 3 && daysUntil(i.expiryDate) >= 0)
    .sort((a, b) => daysUntil(a.expiryDate!) - daysUntil(b.expiryDate!))

  const expired = data.ingredients
    .filter(i => i.expiryDate && daysUntil(i.expiryDate) < 0)

  const stats = [
    { icon: '🥬', value: data.ingredients.length, label: '食材库存', color: 'bg-green-soft' },
    { icon: '⚠️', value: expiringSoon.length + expired.length, label: '过期/临期', color: 'bg-orange-soft' },
    { icon: '🔥', value: todayCal, label: '今日摄入kcal', color: 'bg-yellow-soft' },
    { icon: '📖', value: allRecipes.length, label: '食谱总数', color: 'bg-blue-soft' },
  ]

  function handleGenerate() {
    const newMenu = generateDailyMenu(allRecipes, data.ingredients, data.mealLogs)
    setMenu(newMenu)
    setCurrentMenu(newMenu)
  }

  function handleAdopt() {
    if (!menu) return
    const existingIds = new Set(data.mealLogs.filter(l => l.date === todayStr).map(l => l.recipeId))
    for (const recipes of Object.values(menu)) {
      for (const r of recipes) {
        if (!existingIds.has(r.id)) {
          addMealLog(createMealLog(r.id, r.name, r.mealType, todayStr))
          existingIds.add(r.id)
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Expired alert */}
      {(expired.length > 0 || expiringSoon.length > 0) && (
        <div className="bg-red-soft rounded-xl p-4">
          <h3 className="font-bold text-sm text-red-700 mb-2">⚠️ 需要处理</h3>
          {expired.map(i => (
            <div key={i.id} className="text-sm text-red-600">❌ {i.name} 已过期 {Math.abs(daysUntil(i.expiryDate!))} 天</div>
          ))}
          {expiringSoon.map(i => (
            <div key={i.id} className="text-sm text-orange-600">⚠️ {i.name} 还有 {daysUntil(i.expiryDate!)} 天过期</div>
          ))}
        </div>
      )}

      {/* Daily Menu */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">📋 今日推荐菜单</h2>
          <div className="flex gap-2">
            <button onClick={handleGenerate} className="text-xs bg-mint-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-mint-600">🎲 生成</button>
            {menu && <button onClick={handleAdopt} className="text-xs bg-mint-700 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-mint-800">✅ 采用</button>}
          </div>
        </div>
        {menu ? (
          <div className="space-y-3">
            {(['早餐', '午餐', '晚餐', '加餐'] as const).map(meal => {
              const key = meal === '早餐' ? 'breakfast' : meal === '午餐' ? 'lunch' : meal === '晚餐' ? 'dinner' : 'snack'
              const recipes = menu[key]
              if (!recipes.length) return null
              const icons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }
              return (
                <div key={meal}>
                  <h3 className="text-xs font-bold text-gray-500 mb-1.5">{icons[key]} {meal}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recipes.map(r => (
                      <RecipeCard key={r.id} recipe={r} onClick={() => setDetail(r)} />
                    ))}
                  </div>
                </div>
              )
            })}
            {(() => {
              const totalCal = Object.values(menu).flat().reduce((s, r) => s + r.nutrition.cal, 0)
              const pct = Math.min(100, Math.round(totalCal / 1800 * 100))
              return (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>热量进度</span><span>{totalCal} / 1800 kcal ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-mint-400 to-mint-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">👨‍🍳</div>
            <p className="text-sm">点击生成，系统会根据当前食材推荐菜单</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/ingredients" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">🥬</div>
          <div className="text-sm font-medium text-gray-700">管理食材</div>
        </a>
        <a href="/meal-log" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-sm font-medium text-gray-700">饮食记录</div>
        </a>
      </div>

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
