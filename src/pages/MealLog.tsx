import { useState, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { getAllRecipes } from '../lib/recipe-recommend'
import { createMealLog, today, formatDate } from '../data/storage'
import RecipeDetailModal from '../components/RecipeDetailModal'
import type { Recipe, MealType } from '../types'

const MEAL_TYPES: MealType[] = ['早餐', '午餐', '晚餐', '加餐']
const MEAL_ICONS: Record<string, string> = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍎' }

export default function MealLog() {
  const { data, addMealLog, updateMealLog, toggleCooked, deleteMealLog } = useApp()
  const [detail, setDetail] = useState<Recipe | null>(null)
  const [selectedDate, setSelectedDate] = useState(today())
  const [addingMeal, setAddingMeal] = useState<MealType | null>(null)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoTarget, setPhotoTarget] = useState<string | null>(null)

  const allRecipes = useMemo(() => getAllRecipes(data.customRecipes), [data.customRecipes])
  const dayLogs = data.mealLogs.filter(l => l.date === selectedDate)
  const todayStr = today()

  function handleAddRecipe(recipe: Recipe) {
    addMealLog(createMealLog(recipe.id, recipe.name, addingMeal!, selectedDate))
    setAddingMeal(null)
  }

  function handlePhotoCapture(logId: string) {
    setPhotoTarget(logId)
    fileRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !photoTarget) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      updateMealLog(photoTarget, {
        photoId: dataUrl,
        cooked: true,
        cookedAt: new Date().toISOString(),
      })
      setViewPhoto(dataUrl)
    }
    reader.readAsDataURL(file)
    setPhotoTarget(null)
    e.target.value = ''
  }

  function changeDate(delta: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const dayCal = dayLogs.filter(l => l.cooked).reduce((sum, l) => {
    const r = allRecipes.find(rec => rec.id === l.recipeId)
    return sum + (r?.nutrition.cal || 0)
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">📝 饮食记录</h2>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="text-gray-400 px-2 text-xl">‹</button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">{formatDate(selectedDate)}</span>
          {selectedDate === todayStr && <span className="text-xs bg-mint-100 text-mint-700 px-2 py-0.5 rounded-full">今天</span>}
          <button onClick={() => setSelectedDate(todayStr)} className="text-xs text-mint-600 underline">今天</button>
        </div>
        <button onClick={() => changeDate(1)}
          className={`px-2 text-xl ${selectedDate >= todayStr ? 'text-gray-200' : 'text-gray-400'}`}
          disabled={selectedDate >= todayStr}>›</button>
      </div>

      <div className="bg-mint-50 rounded-xl p-3 text-center">
        <div className="text-2xl font-bold text-mint-700">{dayCal}</div>
        <div className="text-xs text-gray-500">当日摄入 kcal</div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {MEAL_TYPES.map(meal => {
        const logs = dayLogs.filter(l => l.mealType === meal)
        return (
          <div key={meal} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-700">{MEAL_ICONS[meal]} {meal}</h3>
              {selectedDate >= todayStr && (
                <button onClick={() => setAddingMeal(meal)} className="text-xs bg-mint-100 text-mint-700 px-2.5 py-1 rounded-full font-medium">+ 添加</button>
              )}
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">还没记录</p>
            ) : (
              <div className="space-y-2">
                {logs.map(log => {
                  const recipe = allRecipes.find(r => r.id === log.recipeId)
                  return (
                    <div key={log.id} className="flex items-center gap-3 py-1.5">
                      <button onClick={() => toggleCooked(log.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
                          log.cooked ? 'bg-mint-500 border-mint-500 text-white' : 'border-gray-300'
                        }`}>
                        {log.cooked ? '✓' : ''}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800">{log.recipeName}</div>
                        {recipe && <div className="text-xs text-gray-400">🔥 {recipe.nutrition.cal}kcal</div>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => {
                          if (log.photoId) setViewPhoto(log.photoId)
                          else handlePhotoCapture(log.id)
                        }} className={`text-xs px-2 py-1 rounded-lg ${log.photoId ? 'bg-mint-100 text-mint-700' : 'bg-gray-100 text-gray-500'}`}>
                          {log.photoId ? '📷' : '📸'}
                        </button>
                        {recipe && (
                          <button onClick={() => setDetail(recipe)} className="text-xs text-mint-600 px-1">详情</button>
                        )}
                        <button onClick={() => deleteMealLog(log.id)} className="text-xs text-red-400 px-1">✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {addingMeal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAddingMeal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[70vh] overflow-y-auto p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-3">{MEAL_ICONS[addingMeal]} 选择{addingMeal}食谱</h3>
            <div className="space-y-2">
              {allRecipes.filter(r => r.mealType === addingMeal).map(r => (
                <button key={r.id} onClick={() => handleAddRecipe(r)}
                  className="w-full text-left p-3 rounded-xl border border-warm-200 hover:bg-mint-50 transition-colors">
                  <span className="text-sm font-medium text-gray-800">{r.emoji} {r.name}</span>
                  <span className="text-xs text-gray-400 ml-2">🔥 {r.nutrition.cal}kcal</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewPhoto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewPhoto(null)}>
          <img src={viewPhoto} alt="烹饪成果" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
