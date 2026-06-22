import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getAllRecipes, getRecipeCookCount, getLastCookedDay, getCookedIds, getIngredientMatch } from '../lib/recipe-recommend'
import RecipeCard from '../components/RecipeCard'
import RecipeDetailModal from '../components/RecipeDetailModal'
import { genId } from '../data/storage'
import type { Recipe, MealType, Difficulty } from '../types'

const MEAL_TYPES = ['全部', '早餐', '午餐', '晚餐', '加餐'] as const
const MEAL_ICONS: Record<string, string> = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍎', '全部': '📖' }
const DIFF_LABELS = ['全部难度', '⭐简单', '⭐⭐中等']

export default function Recipes() {
  const { data, addCustomRecipe, deleteCustomRecipe } = useApp()
  const [mealFilter, setMealFilter] = useState<string>('全部')
  const [diffFilter, setDiffFilter] = useState(0) // 0=all, 1=simple, 2=medium
  const [hideCooked, setHideCooked] = useState(false)
  const [matchFilter, setMatchFilter] = useState('all') // all | can_make | missing
  const [detail, setDetail] = useState<Recipe | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', mealType: '午餐' as MealType, difficulty: 1 as Difficulty, cookTime: 15, ingredients: '' as string, steps: '' as string, tags: '' as string, emoji: '🍽️' })

  const allRecipes = useMemo(() => getAllRecipes(data.customRecipes), [data.customRecipes])
  const cookedIds = useMemo(() => getCookedIds(data.mealLogs), [data.mealLogs])

  const filtered = useMemo(() => {
    let list = allRecipes
    if (mealFilter !== '全部') list = list.filter(r => r.mealType === mealFilter)
    if (diffFilter > 0) list = list.filter(r => r.difficulty === diffFilter)
    if (hideCooked) list = list.filter(r => !cookedIds.has(r.id))
    if (matchFilter === 'can_make') list = list.filter(r => getIngredientMatch(r, data.ingredients).total > 0 && getIngredientMatch(r, data.ingredients).match >= getIngredientMatch(r, data.ingredients).total)
    if (matchFilter === 'missing') list = list.filter(r => getIngredientMatch(r, data.ingredients).total > 0 && getIngredientMatch(r, data.ingredients).match < getIngredientMatch(r, data.ingredients).total)
    return list
  }, [allRecipes, mealFilter, diffFilter, hideCooked, cookedIds, matchFilter, data.ingredients])

  function saveCustom() {
    if (!form.name.trim()) return
    const recipe: Recipe = {
      id: 'custom-' + genId(),
      name: form.name,
      mealType: form.mealType,
      difficulty: form.difficulty,
      ingredients: form.ingredients.split('\n').filter(s => s.trim()).map(s => ({ name: s.trim(), qty: '' })),
      steps: form.steps.split('\n').filter(s => s.trim()),
      cookTime: form.cookTime,
      nutrition: { cal: 0, protein: 0, carb: 0, fat: 0 },
      tags: form.tags.split(/[,，、\s]+/).filter(s => s.trim()),
      emoji: form.emoji,
      source: 'custom',
    }
    addCustomRecipe(recipe)
    setShowForm(false)
    setForm({ name: '', mealType: '午餐', difficulty: 1, cookTime: 15, ingredients: '', steps: '', tags: '', emoji: '🍽️' })
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="section-card">
        <div className="section-header">
          <h2><span>📖</span> 食谱库</h2>
          <button onClick={() => setShowForm(true)} className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium hover:bg-white/30 transition">+ 自定义</button>
        </div>
        <div className="section-body">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">📖 食谱库</h2>
        <button onClick={() => setShowForm(true)} className="text-sm bg-mint-500 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-mint-600">+ 自定义</button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {MEAL_TYPES.map(m => (
          <button key={m} onClick={() => setMealFilter(m)} className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${mealFilter === m ? 'bg-mint-500 text-white' : 'bg-white text-gray-600'}`}>
            {MEAL_ICONS[m]} {m}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <select value={diffFilter} onChange={e => setDiffFilter(Number(e.target.value))} className="text-xs border border-warm-200 rounded-lg p-1.5 bg-white text-gray-600">
          {DIFF_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
        </select>
        <select value={matchFilter} onChange={e => setMatchFilter(e.target.value)} className="text-xs border border-warm-200 rounded-lg p-1.5 bg-white text-gray-600">
          <option value="all">全部</option>
          <option value="can_make">🟢 可做</option>
          <option value="missing">🟡 缺食材</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          <input type="checkbox" checked={hideCooked} onChange={e => setHideCooked(e.target.checked)} className="rounded" />
          隐藏已做
        </label>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} 道菜</span>
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(r => {
          const cc = getRecipeCookCount(data.mealLogs, r.id)
          const lc = getLastCookedDay(data.mealLogs, r.id)
          return (
            <div key={r.id} className="relative">
              {r.source === 'custom' && (
                <button onClick={() => deleteCustomRecipe(r.id)} className="absolute top-1 right-1 z-10 text-xs bg-white/80 rounded-full px-1.5 py-0.5 text-red-500">✕</button>
              )}
              <RecipeCard
                recipe={r}
                onClick={() => setDetail(r)}
                cookedCount={cc}
                lastCooked={lc !== null ? `${lc}天前` : undefined}
                matchInfo={getIngredientMatch(r, data.ingredients)}
              />
            </div>
          )
        })}

        </div>
      </div>
      </div>

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />

      {/* Custom recipe form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4">➕ 自定义食谱</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e.target.value}))} placeholder="emoji" className="text-sm border border-warm-200 rounded-lg p-2.5 text-center focus:outline-none focus:border-mint-400" />
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="菜名" className="col-span-2 text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select value={form.mealType} onChange={e => setForm(f => ({...f, mealType: e.target.value as MealType}))} className="text-sm border border-warm-200 rounded-lg p-2.5">
                  <option value="早餐">🌅 早餐</option><option value="午餐">☀️ 午餐</option><option value="晚餐">🌙 晚餐</option><option value="加餐">🍎 加餐</option>
                </select>
                <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: Number(e.target.value) as Difficulty}))} className="text-sm border border-warm-200 rounded-lg p-2.5">
                  <option value={1}>⭐简单</option><option value={2}>⭐⭐中等</option>
                </select>
                <input type="number" value={form.cookTime} onChange={e => setForm(f => ({...f, cookTime: Number(e.target.value)}))} placeholder="分钟" className="text-sm border border-warm-200 rounded-lg p-2.5" />
              </div>
              <textarea value={form.ingredients} onChange={e => setForm(f => ({...f, ingredients: e.target.value}))} placeholder="食材（每行一个，如：鸡胸肉 200g）" className="w-full text-sm border border-warm-200 rounded-lg p-2.5 resize-none h-16 focus:outline-none focus:border-mint-400" />
              <textarea value={form.steps} onChange={e => setForm(f => ({...f, steps: e.target.value}))} placeholder="步骤（每行一步）" className="w-full text-sm border border-warm-200 rounded-lg p-2.5 resize-none h-20 focus:outline-none focus:border-mint-400" />
              <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="标签（逗号分隔，如：快手菜,高蛋白）" className="w-full text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveCustom} className="flex-1 bg-mint-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-mint-600">保存</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
